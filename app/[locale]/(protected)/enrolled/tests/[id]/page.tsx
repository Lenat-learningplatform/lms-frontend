"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { handleErrorMessage } from "@/lib/hasPermission";
import { Loader2 } from "lucide-react";

// *******************************
// Zod Schema for Response Form
// *******************************
const responseSchema = z.object({
  responses: z
    .array(
      z.object({
        question_id: z.string(),
        question_type: z.enum(["choice", "short"]),
        option_id: z.string().optional(),
        short_answer: z.string().optional(),
      })
    )
    .refine(
      (responses) =>
        responses.every((response) => {
          if (response.question_type === "choice") {
            return response.option_id !== undefined;
          } else {
            return (
              response.short_answer !== undefined &&
              response.short_answer.trim() !== ""
            );
          }
        }),
      {
        message: "All questions must be answered",
        path: ["responses"],
      }
    ),
});

type ResponseFormValues = z.infer<typeof responseSchema>;

// *******************************
// Data Fetching Functions
// *******************************
const fetchTestQuestions = async (testId: string) => {
  const response = await api.get(`/test-questions/${testId}`);
  return response.data.data;
};

// *******************************
// TestQuestions Component
// *******************************
const TestQuestions = () => {
  const { id } = useParams();
  const testId = id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  // Fetch questions for the test
  const {
    data: questions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["test-questions", testId],
    queryFn: () => fetchTestQuestions(testId),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      responses: [],
    },
  });

  // Initialize form with questions
  React.useEffect(() => {
    if (questions) {
      const initialResponses = [
        ...(questions.choice || []).map((q: any) => ({
          question_id: q.id,
          question_type: "choice" as const,
          option_id: "",
        })),
        ...(questions.short || []).map((q: any) => ({
          question_id: q.id,
          question_type: "short" as const,
          short_answer: "",
        })),
      ];

      // You might need to set the default values here if your form library supports it
    }
  }, [questions]);

  const submitResponse = useMutation({
    mutationFn: async (data: ResponseFormValues) => {
      return api.post("/question-response", data);
    },
    onSuccess: () => {
      router.back();
      toast.success("Test submitted successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<ResponseFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await submitResponse.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (isError) return <div>Error: {(error as any).message}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded shadow-md max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Questions</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Choice Questions */}
          {questions?.choice && questions.choice.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Multiple Choice Questions
              </h2>
              <div className="space-y-6">
                {questions.choice.map((question: any, qIndex: number) => (
                  <div key={question.id} className="border p-4 rounded-lg">
                    <div className="mb-3">
                      <p className="font-medium">
                        {qIndex + 1}. {question.name}
                      </p>
                      {question.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {question.description}
                        </p>
                      )}
                    </div>

                    <input
                      type="hidden"
                      {...register(`responses.${qIndex}.question_id`)}
                      value={question.id}
                    />
                    <input
                      type="hidden"
                      {...register(`responses.${qIndex}.question_type`)}
                      value="choice"
                    />

                    <RadioGroup
                      onValueChange={(value) => {
                        // You might need to set the selected option_id here
                      }}
                      className="space-y-2"
                    >
                      {question.options.map((option: any) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option.id}
                            id={`option-${option.id}`}
                            {...register(`responses.${qIndex}.option_id`)}
                          />
                          <Label htmlFor={`option-${option.id}`}>
                            {option.choice}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Short Answer Questions */}
          {questions?.short && questions.short.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Short Answer Questions
              </h2>
              <div className="space-y-6">
                {questions.short.map((question: any, qIndex: number) => {
                  const shortIndex = (questions?.choice?.length || 0) + qIndex;
                  return (
                    <div key={question.id} className="border p-4 rounded-lg">
                      <div className="mb-3">
                        <p className="font-medium">
                          {shortIndex + 1}. {question.name}
                        </p>
                        {question.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {question.description}
                          </p>
                        )}
                      </div>

                      <input
                        type="hidden"
                        {...register(`responses.${shortIndex}.question_id`)}
                        value={question.id}
                      />
                      <input
                        type="hidden"
                        {...register(`responses.${shortIndex}.question_type`)}
                        value="short"
                      />

                      <Input
                        placeholder="Type your answer here..."
                        {...register(`responses.${shortIndex}.short_answer`)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {errors.responses && (
            <p className="text-red-500 text-sm">{errors.responses.message}</p>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/tests">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestQuestions;
