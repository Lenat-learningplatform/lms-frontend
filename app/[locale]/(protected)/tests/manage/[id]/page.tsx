"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import {
  useForm,
  SubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleErrorMessage } from "@/lib/hasPermission";

// *******************************
// Data Fetching Functions
// *******************************
const fetchTestDetail = async (id: string) => {
  const response = await api.get(`/tests/${id}`);
  return response.data.data;
};

const fetchQuestions = async (id: string) => {
  const response = await api.get(`/questions?test_id=${id}`);
  return response.data.data;
};

// *******************************
// Zod Schema for Question Form
// *******************************
const questionSchema = z
  .object({
    id: z.string().optional(),
    test_id: z.string(),
    question_type: z.enum(["choice", "short"]),
    // Our form uses "question" even though API returns it as "name"
    question: z.string().min(1, { message: "Question is required" }),
    score_value: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: "Score must be at least 1" })
    ),
    options: z
      .array(
        z.object({
          choice: z.string().min(1, { message: "Option text is required" }),
          is_correct: z.boolean(),
        })
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.question_type === "choice"
        ? data.options && data.options.length > 0
        : true,
    {
      message: "At least one option is required for choice questions",
      path: ["options"],
    }
  );

type QuestionFormValues = z.infer<typeof questionSchema>;

// *******************************
// QuestionForm Component (used in modal)
// *******************************
interface QuestionFormProps {
  testId: string;
  questionToEdit?: QuestionFormValues;
  onFinishEdit: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  testId,
  questionToEdit,
  onFinishEdit,
}) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: questionToEdit
      ? { ...questionToEdit }
      : {
          test_id: testId,
          question_type: "choice",
          question: "",
          score_value: 1,
          options: [{ choice: "", is_correct: false }],
        },
  });

  // Reset form when questionToEdit changes.
  useEffect(() => {
    if (questionToEdit) {
      reset({ ...questionToEdit });
    } else {
      reset({
        test_id: testId,
        question_type: "choice",
        question: "",
        score_value: 1,
        options: [{ choice: "", is_correct: false }],
      });
    }
  }, [questionToEdit, reset, testId]);

  // Setup field array for options.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  // Watch question type for conditional options rendering.
  const questionType = useWatch({ control, name: "question_type" });

  useEffect(() => {
    if (questionType === "short") {
      setValue("options", []);
    } else {
      const currentOptions = watch("options");
      if (!currentOptions || currentOptions.length === 0) {
        setValue("options", [{ choice: "", is_correct: false }]);
      }
    }
  }, [questionType, setValue, watch]);

  const mutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      // When sending data, map "question" to "name" for the API.
      const payload = { ...data, name: data.question };
      if (data.id) {
        return api.patch(`/questions/${data.id}`, payload);
      }
      return api.post("/questions", payload);
    },
    onSuccess: () => {
      toast.success(
        questionToEdit
          ? "Question updated successfully!"
          : "Question added successfully!"
      );
      queryClient.invalidateQueries({ queryKey: ["questions", testId] });
      reset({
        test_id: testId,
        question_type: "choice",
        question: "",
        score_value: 1,
        options: [{ choice: "", is_correct: false }],
      });
      onFinishEdit();
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<QuestionFormValues> = async (data) => {
    if (data.question_type === "short") {
      data.options = undefined;
    }
    await mutation.mutateAsync(data);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden fields */}
        <input type="hidden" {...register("test_id")} />
        {questionToEdit && <input type="hidden" {...register("id")} />}

        {/* Question Type */}
        <div>
          <Label htmlFor="question_type">Question Type</Label>
          <select
            id="question_type"
            {...register("question_type")}
            className="mt-1 block w-full"
          >
            <option value="choice">Choice</option>
            <option value="short">Short Answer</option>
          </select>
          {errors.question_type && (
            <p className="text-red-500 text-sm">
              {errors.question_type.message}
            </p>
          )}
        </div>

        {/* Question Text */}
        <div>
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            placeholder="Enter question text"
            {...register("question")}
          />
          {errors.question && (
            <p className="text-red-500 text-sm">{errors.question.message}</p>
          )}
        </div>

        {/* Score Value */}
        <div>
          <Label htmlFor="score_value">Score Value</Label>
          <Input
            type="number"
            id="score_value"
            min={1}
            {...register("score_value", { valueAsNumber: true })}
          />
          {errors.score_value && (
            <p className="text-red-500 text-sm">{errors.score_value.message}</p>
          )}
        </div>

        {/* Options for Choice Type */}
        {questionType === "choice" && (
          <div>
            <h3 className="font-semibold mb-2">Options</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  {...register(`options.${index}.choice` as const)}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register(`options.${index}.is_correct` as const)}
                    className="mr-1"
                  />
                  <Label>Correct</Label>
                </div>
                <Button type="button" onClick={() => remove(index)}>
                  Remove
                </Button>
              </div>
            ))}
            {errors.options && typeof errors.options.message === "string" && (
              <p className="text-red-500 text-sm">{errors.options.message}</p>
            )}
            <Button
              type="button"
              onClick={() => append({ choice: "", is_correct: false })}
            >
              Add Option
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? questionToEdit
                ? "Updating..."
                : "Submitting..."
              : questionToEdit
              ? "Update Question"
              : "Add Question"}
          </Button>
          <Button type="button" onClick={onFinishEdit} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

// *******************************
// ManageTests Component
// *******************************
const ManageTests = () => {
  const { id } = useParams();
  const testId = id as string;
  const queryClient = useQueryClient();
  // Holds the question being edited; null means modal is closed.
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionFormValues | null>(null);

  // Fetch test details.
  const {
    data: testData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["test", testId],
    queryFn: () => fetchTestDetail(testId),
  });

  // Fetch questions for the test.
  const {
    data: questions,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
    error: questionsError,
  } = useQuery({
    queryKey: ["questions", testId],
    queryFn: () => fetchQuestions(testId),
  });

  // Delete mutation.
  const deleteMutation = useMutation({
    mutationFn: async (questionId: string) => {
      return api.delete(`/questions/${questionId}`);
    },
    onSuccess: () => {
      toast.success("Question deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["questions", testId] });
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  if (isLoading || isQuestionsLoading) return <p>Loading test...</p>;
  if (isError) return <p>Error: {(error as any).message}</p>;
  if (isQuestionsError) return <p>Error: {(questionsError as any).message}</p>;

  // Helper to render a list of questions.
  const renderQuestions = (questionArray: any[]) =>
    questionArray.map((question: any) => (
      <li
        key={question.id}
        className="border p-4 rounded bg-gray-50 dark:bg-gray-700 flex justify-between items-center"
      >
        <div>
          <p className="font-medium">{question.name}</p>
          <p>Type: {question.question_type}</p>
          <p>Score: {question.score_value}</p>
          {question.question_type === "choice" && question.options && (
            <ul className="ml-4 mt-2">
              {question.options.map((opt: any, idx: number) => (
                <li key={idx}>
                  {opt.choice} {opt.is_correct ? "(Correct)" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            onClick={() =>
              // Map API's "name" to form's "question" for editing.
              setEditingQuestion({ ...question, question: question.name })
            }
          >
            Edit
          </Button>
          <Button
            type="button"
            onClick={() => deleteMutation.mutate(question.id)}
          >
            Delete
          </Button>
        </div>
      </li>
    ));

  return (
    <div className="min-h-screen  dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded shadow-md max-w-4xl mx-auto">
        {/* Test Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{testData.name}</h1>
          <p className="mt-2">{testData.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Start Date:</p>
              <p>{testData.start_date}</p>
            </div>
            <div>
              <p className="font-semibold">Due Date:</p>
              <p>{testData.due_date}</p>
            </div>
            <div>
              <p className="font-semibold">Duration:</p>
              <p>
                {testData.duration} {testData.duration_unit}
              </p>
            </div>
            <div>
              <p className="font-semibold">Created At:</p>
              <p>{new Date(testData.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Add New Question Button */}
        <div className="mb-6">
          <Button
            type="button"
            onClick={() =>
              setEditingQuestion({
                test_id: testId,
                question_type: "choice",
                question: "",
                score_value: 1,
                options: [{ choice: "", is_correct: false }],
              })
            }
          >
            Add New Question
          </Button>
        </div>

        {/* Questions List */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Choice Questions</h2>
          {questions && questions?.choice && questions.choice.length > 0 ? (
            <ul className="space-y-2">{renderQuestions(questions.choice)}</ul>
          ) : (
            <p>No choice questions added yet.</p>
          )}
          <h2 className="text-2xl font-semibold mt-8 mb-4">
            Short Answer Questions
          </h2>
          {questions && questions?.short && questions.short.length > 0 ? (
            <ul className="space-y-2">{renderQuestions(questions.short)}</ul>
          ) : (
            <p>No short questions added yet.</p>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Question */}
      {editingQuestion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-lg relative">
            <button
              onClick={() => setEditingQuestion(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              X
            </button>
            <QuestionForm
              testId={testId}
              questionToEdit={editingQuestion}
              onFinishEdit={() => setEditingQuestion(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTests;
