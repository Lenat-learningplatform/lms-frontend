"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle, Clock, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Loader2 } from "lucide-react";

import { handleErrorMessage } from "@/lib/hasPermission";

const fetchStudentResponses = async (testId: string, studentId: string) => {
  const response = await api.get(`/student-responses/${testId}/${studentId}`);
  return response.data.data;
};

const evaluateShortAnswer = async (answerId: string, score: number) => {
  const response = await api.post(`/evaluate-short-answer/${answerId}`, {
    score,
  });
  return response.data;
};

const TeacherTestView = () => {
  const { id: testId, sid: studentId } = useParams();
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({});

  const {
    data: responses,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["student-responses", testId, studentId],
    queryFn: () => fetchStudentResponses(testId as string, studentId as string),
  });

  const evaluateMutation = useMutation({
    mutationFn: ({ answerId, score }: { answerId: string; score: number }) =>
      evaluateShortAnswer(answerId, score),
    onSuccess: () => {
      toast.success("Evaluation saved successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const handleScoreChange = (answerId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setScores((prev) => ({ ...prev, [answerId]: numValue }));
    }
  };

  const handleEvaluate = (answerId: string, scoreValue: number) => {
    const score = scores[answerId];
    if (score === undefined || score > scoreValue || score < 0) {
      toast.error(`Score must be between 0 and ${scoreValue}`);
      return;
    }
    evaluateMutation.mutate({ answerId, score });
  };

  const getStatusIcon = (question: any) => {
    if (!question.is_evaluated)
      return <Clock className="h-4 w-4 text-yellow-500" />;
    if (question.is_correct)
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (question.is_correct === false)
      return <XCircle className="h-4 w-4 text-red-500" />;
    return <HelpCircle className="h-4 w-4 text-gray-500" />;
  };

  const getStatusText = (question: any) => {
    if (!question.is_evaluated) return "Pending evaluation";
    if (question.is_correct) return "Correct";
    if (question.is_correct === false) return "Incorrect";
    return "Not evaluated";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Error Loading Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{handleErrorMessage(error)}</p>
            {/* <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.back()}
            >
              Go Back
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!responses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Responses Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn&apos;t find any responses for this student.</p>
            {/* <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.back()}
            >
              Go Back
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Test Responses
          </h1>
          {/* <Button variant="outline" onClick={() => router.back()}>
            Back to Students
          </Button> */}
        </div>

        {/* Multiple Choice Responses */}
        {responses.choice && responses.choice.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Multiple Choice Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {responses.choice.map((question: any) => (
                  <div
                    key={question.id}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(question)}
                      <span className="text-sm font-medium">
                        {getStatusText(question)}
                      </span>
                    </div>
                    <p className="font-medium">{question.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-gray-500">
                          Student&apos;s Answer:
                        </Label>
                        <p className="mt-1">{question.answer}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Correct Answer:</Label>
                        <p className="mt-1">{question.correct_answer}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-gray-500">Score:</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge>
                          {question.score} / {question.score_value}
                        </Badge>
                        {question.is_correct ? (
                          <span className="text-green-600 dark:text-green-400 text-sm">
                            Correct
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 text-sm">
                            Incorrect
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Short Answer Responses */}
        {responses.short && responses.short.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Short Answer Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {responses.short.map((question: any) => (
                  <div
                    key={question.id}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(question)}
                      <span className="text-sm font-medium">
                        {getStatusText(question)}
                      </span>
                    </div>
                    <p className="font-medium">{question.question}</p>
                    <div className="mt-2">
                      <Label className="text-gray-500">
                        Student&apos;s Answer:
                      </Label>
                      <p className="mt-1 whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-3 rounded">
                        {question.answer}
                      </p>
                    </div>

                    {question.is_evaluated ? (
                      <div className="mt-3">
                        <Label className="text-gray-500">Score:</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge>
                            {question.score} / {question.score_value}
                          </Badge>
                        </div>
                        {question.correct_answer && (
                          <div className="mt-2">
                            <Label className="text-gray-500">Feedback:</Label>
                            <p className="mt-1 whitespace-pre-wrap bg-green-50 dark:bg-green-900/30 p-3 rounded">
                              {question.correct_answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 space-y-2">
                        <Label htmlFor={`score-${question.id}`}>
                          Assign Score (0 - {question.score_value}):
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`score-${question.id}`}
                            type="number"
                            min="0"
                            max={question.score_value}
                            value={scores[question.id] || ""}
                            onChange={(e) =>
                              handleScoreChange(question.id, e.target.value)
                            }
                            className="w-20"
                          />
                          <Button
                            onClick={() =>
                              handleEvaluate(question.id, question.score_value)
                            }
                            disabled={evaluateMutation.isPending}
                          >
                            {evaluateMutation.isPending ? (
                              <Loader2 className="h-4 w-4" />
                            ) : (
                              "Submit Score"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Evaluation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-500">Total Questions</h3>
                <p className="text-2xl font-bold mt-1">
                  {(responses.choice?.length || 0) +
                    (responses.short?.length || 0)}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-500">Evaluated</h3>
                <p className="text-2xl font-bold mt-1">
                  {(responses.choice?.filter((q: any) => q.is_evaluated)
                    .length || 0) +
                    (responses.short?.filter((q: any) => q.is_evaluated)
                      .length || 0)}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-500">
                  Pending Evaluation
                </h3>
                <p className="text-2xl font-bold mt-1">
                  {responses.short?.filter((q: any) => !q.is_evaluated)
                    .length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherTestView;
