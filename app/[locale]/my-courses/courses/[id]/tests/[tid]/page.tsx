"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { handleErrorMessage } from "@/lib/hasPermission";
import { Check, Loader2 } from "lucide-react";

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
            return (
              response.option_id !== undefined &&
              response.option_id.trim() !== ""
            );
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

const startTest = async (testId: string) => {
  const response = await api.post(`/start-test/${testId}`);
  return response.data;
};

const completeTest = async (testId: string) => {
  const response = await api.post(`/complete-test/${testId}`);
  return response.data;
};

// *******************************
// Timer Component
// *******************************
const Timer = ({
  startDate,
  duration,
}: {
  startDate: string; // Start date in UTC (e.g., "2025-06-25 14:57:01")
  duration: number; // Duration in minutes
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration * 60); // Convert duration to seconds

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nowUTC = new Date(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      );

      const startUTC = new Date(startDate);
      const elapsed = Math.floor(
        (nowUTC.getTime() - startUTC.getTime()) / 1000
      );
      const remaining = duration * 60 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, duration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="text-lg font-bold text-red-500">
      Time Left: {formatTime(timeLeft)}
    </div>
  );
};

// *******************************
// TestQuestions Component
// *******************************
const TestQuestions = () => {
  const { tid } = useParams();
  const testId = tid as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    data: testData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["test-questions", testId],
    queryFn: () => fetchTestQuestions(testId),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      responses: [],
    },
  });

  useEffect(() => {
    if (testData) {
      const { questions } = testData;
      const defaultResponses: ResponseFormValues["responses"] = [];
      let questionIndex = 0;

      if (questions.choice) {
        questions.choice.forEach((q: any) => {
          defaultResponses[questionIndex] = {
            question_id: q.id,
            question_type: "choice",
            option_id: "",
          };
          questionIndex++;
        });
      }

      if (questions.short) {
        questions.short.forEach((q: any) => {
          defaultResponses[questionIndex] = {
            question_id: q.id,
            question_type: "short",
            short_answer: "",
          };
          questionIndex++;
        });
      }

      setValue("responses", defaultResponses);
    }
  }, [testData, setValue]);

  const startTestMutation = useMutation({
    mutationFn: () => startTest(testId),
    onSuccess: () => {
      toast.success("Test started successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const completeTestMutation = useMutation({
    mutationFn: () => completeTest(testId),
    onSuccess: () => {
      toast.success("Test completed successfully!");
      router.back();
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const saveResponseMutation = useMutation({
    mutationFn: async (data: ResponseFormValues) => {
      return api.post("/question-response", { ...data, test_id: testId });
    },
    onSuccess: () => {
      toast.success("Response saved successfully!");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const onSubmit: SubmitHandler<ResponseFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await saveResponseMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const responses = watch("responses");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (isError) return <div>Error: {(error as any).message}</div>;

  const {
    questions,
    is_started,
    duration,
    start_date,
    question_count,
    test_name,
  } = testData;

  return (
    <div className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded-lg border border-brand-border mx-auto">
      <div className="flex justify-between items-center mb-6  border-b pb-4 text-brand-dark">
        <h1 className="text-2xl font-bold ">{test_name}</h1>
        <div className="text-left">
          <p className="text-sm dark:text-gray-400">
            Total Questions: {question_count}
          </p>
          <p className="text-sm dark:text-gray-400">
            Time Given: {duration} minutes
          </p>
        </div>
      </div>

      {!is_started ? (
        <div className="flex justify-center">
          <Button
            onClick={() => startTestMutation.mutate()}
            disabled={startTestMutation.isPending}
          >
            {startTestMutation.isPending ? "Starting..." : "Start Test"}
          </Button>
        </div>
      ) : (
        <>
          <Timer startDate={start_date} duration={parseInt(duration)} />
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 text-brand-dark"
          >
            {questions.choice && questions.choice.length > 0 && (
              <div>
                <div className="space-y-6">
                  {questions.choice.map((question: any, qIndex: number) => (
                    <div
                      key={question.id}
                      className="border-b p-4 rounded-lg pb-6"
                    >
                      <div className="mb-3">
                        <p className="font-medium">
                          {qIndex + 1}. {question.name}
                        </p>
                        {question.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 pl-0 md:pl-14">
                            {question.description}
                          </p>
                        )}
                      </div>

                      <RadioGroup
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:pl-10"
                        onValueChange={(value) => {
                          setValue(`responses.${qIndex}.option_id`, value, {
                            shouldValidate: true,
                          });
                        }}
                      >
                        {question.options.map((option: any) => (
                          <Label
                            key={option.id}
                            htmlFor={`option-${option.id}`}
                            className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <RadioGroupItem
                              value={option.id}
                              id={`option-${option.id}`}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-sm border-2 border-brand-light  dark:border-gray-500 flex items-center justify-center ${
                                responses &&
                                responses[qIndex]?.option_id === option.id &&
                                "bg-brand-light"
                              }`}
                            >
                              {responses &&
                                responses[qIndex]?.option_id === option.id && (
                                  <Check className="h-4 w-4 text-white" />
                                )}
                            </div>
                            <span>{option.choice}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questions.short && questions.short.length > 0 && (
              <div>
                <div className="space-y-6">
                  {questions.short.map((question: any, qIndex: number) => {
                    const shortIndex = (questions.choice?.length || 0) + qIndex;
                    return (
                      <div
                        key={question.id}
                        className="border-b p-4 rounded-lg pb-6"
                      >
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
                        <Input
                          placeholder="Write your answer here..."
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
              <Button
                type="button"
                variant="outline"
                onClick={() => completeTestMutation.mutate()}
                disabled={completeTestMutation.isPending}
              >
                {completeTestMutation.isPending
                  ? "Completing..."
                  : "Complete Test"}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Responses"}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default TestQuestions;
