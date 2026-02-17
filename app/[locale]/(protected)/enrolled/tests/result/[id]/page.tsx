"use client";
// eslint-disable-next-line react/no-unescaped-entities
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { handleErrorMessage } from "@/lib/hasPermission";
import { Loader2 } from "lucide-react";

const fetchTestResults = async (testId: string) => {
  const response = await api.get(`/grade-report/${testId}`);
  return response.data.data;
};

const TestResults = () => {
  const { id } = useParams();
  const testId = id as string;

  const {
    data: results,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["test-results", testId],
    queryFn: () => fetchTestResults(testId),
  });

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
            <CardTitle>Error Loading Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{handleErrorMessage(error)}</p>
            {/* <Button variant="outline" className="mt-4" asChild>
              <Link href="/tests">Back to Tests</Link>
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn&apos;t find any results for this test.</p>
            {/* <Button variant="outline" className="mt-4" asChild>
              <Link href="/tests">Back to Tests</Link>
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  const scorePercentage = Math.round(
    (results.overall_total_score / results.overall_total_score_value) * 100
  );

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
    console.log({ question });
    if (!question.is_evaluated) return "Pending evaluation";
    if (question.is_correct)
      return `Correct  ${question.score}/${question.score_value}`;
    if (question.is_correct === false)
      return `Incorrect ${question.score}/${question.score_value}`;
    if (question.is_evaluated)
      return `${question.score}/${question.score_value}`;
    return "Not evaluated";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Test Results
          </h1>
          {/* <Button variant="outline" asChild>
            <Link href="/tests">Back to Tests</Link>
          </Button> */}
        </div>

        {/* Summary Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Questions
                </p>
                <p className="text-2xl font-bold">{results.total_questions}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Your Score
                </p>
                <p className="text-2xl font-bold">
                  {results.overall_total_score} /{" "}
                  {results.overall_total_score_value}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Percentage
                </p>
                <div className="flex items-center space-x-2">
                  <Progress value={scorePercentage} className="h-2" />
                  <span className="text-2xl font-bold">{scorePercentage}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Multiple Choice */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Multiple Choice</h3>
                  <Badge>
                    {results.by_question_type.choice.total_score} /{" "}
                    {results.by_question_type.choice.total_score_value}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {results.by_question_type.choice.by_question.map(
                    (question: any, index: number) => (
                      <div
                        key={index}
                        className="border-b pb-3 last:border-b-0"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(question)}
                          <span className="text-sm font-medium">
                            {getStatusText(question)}
                          </span>
                        </div>
                        <p className="font-medium">{question.question}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                          <div>
                            <p className="text-gray-500">Your answer:</p>
                            <p>{question.answer || "Not answered"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {question.is_evaluated
                                ? "Correct answer:"
                                : "Evaluation:"}
                            </p>
                            <p>
                              {question.is_evaluated
                                ? question.correct_answer || "None"
                                : "Pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Short Answer */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Short Answer</h3>
                  <Badge>
                    {results.by_question_type.short.total_score || "?"} /{" "}
                    {results.by_question_type.short.total_score_value}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {results.by_question_type.short.by_question.map(
                    (question: any, index: number) => (
                      <div
                        key={index}
                        className="border-b pb-3 last:border-b-0"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(question)}
                          <span className="text-sm font-medium">
                            {getStatusText(question)}
                          </span>
                        </div>
                        <p className="font-medium">{question.question}</p>
                        <div className="mt-1">
                          <p className="text-gray-500 text-sm">Your answer:</p>
                          <p className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {question.answer}
                          </p>
                        </div>
                        {question.is_evaluated && question.correct_answer && (
                          <div className="mt-1">
                            <p className="text-gray-500 text-sm">
                              Correct answer:
                            </p>
                            <p className="whitespace-pre-wrap bg-green-50 dark:bg-green-900 p-2 rounded">
                              {question.correct_answer}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {scorePercentage >= 80 ? (
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Excellent Work!
                </h3>
                <p className="mt-1 text-green-700 dark:text-green-300">
                  You&apos;ve scored {scorePercentage}% on this test,
                  demonstrating a strong understanding of the material. Keep up
                  the great work!
                </p>
              </div>
            ) : scorePercentage >= 50 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Good Effort
                </h3>
                <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                  You&apos;ve scored {scorePercentage}% on this test.
                  You&apos;re on the right track, but there&apos;s room for
                  improvement. Review the questions you missed and consider
                  additional study in those areas.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-200 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Needs Improvement
                </h3>
                <p className="mt-1 text-red-700 dark:text-red-300">
                  You&apos;ve scored {scorePercentage}% on this test. We
                  recommend reviewing the material thoroughly and retaking the
                  test when you feel ready. Pay special attention to the
                  questions you missed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestResults;
