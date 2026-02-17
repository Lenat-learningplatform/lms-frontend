"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Trash2, Edit, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { handleErrorMessage } from "@/lib/hasPermission";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DiscussionForm from "@/components/discussion/DiscussionForm";
import { useParams } from "next/navigation";

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    profile_photo_url: string;
  };
  image?: {
    url: string | null;
  };
}

interface DiscussionDetail {
  id: string;
  title: string;
  content: string;
  created_at: string;
  replies: {
    data: Reply[];
    current_page: number;
    last_page: number;
  };
  user: {
    id: string;
    name: string;
    profile_photo_url: string;
  };
  image?: {
    url: string | null;
  };
}

const DiscussionDetailPage = () => {
  const router = useRouter();
  const { id: discussionId } = useParams();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");
  const [replyPage, setReplyPage] = useState(1);
  const [replyHasMore, setReplyHasMore] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditingReply, setIsEditingReply] = useState<string | null>(null);
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");

  // Fetch discussion details
  const { data: discussion, isLoading } = useQuery<DiscussionDetail>({
    queryKey: ["discussion", discussionId],
    queryFn: async () => {
      const response = await api.get(
        `/discussion-detail/${discussionId}?replies_page=${replyPage}`
      );
      return response.data.data;
    },
  });

  // Delete discussion mutation
  const deleteDiscussion = useMutation({
    mutationFn: async () => {
      return api.delete(`/delete-discussion/${discussionId}`);
    },
    onSuccess: () => {
      toast.success("Discussion deleted successfully");
      router.back();
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  // Create reply mutation
  const createReply = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("content", replyContent);
      if (replyImage) {
        formData.append("image", replyImage);
      }
      return api.post(`/create-reply/${discussionId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["discussion", discussionId],
      });
      setReplyContent("");
      setReplyImage(null);
      toast.success("Reply posted successfully");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  // Update reply mutation
  const updateReply = useMutation({
    mutationFn: async (replyId: string) => {
      const formData = new FormData();
      formData.append("content", editingReplyContent);
      return api.patch(`/update-reply/${replyId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["discussion", discussionId],
      });
      setIsEditingReply(null);
      setEditingReplyContent("");
      toast.success("Reply updated successfully");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  // Delete reply mutation
  const deleteReply = useMutation({
    mutationFn: async (replyId: string) => {
      return api.delete(`/delete-reply/${replyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["discussion", discussionId],
      });
      toast.success("Reply deleted successfully");
    },
    onError: (error) => {
      toast.error(handleErrorMessage(error));
    },
  });

  const loadMoreReplies = () => {
    if (
      discussion &&
      discussion.replies.current_page < discussion.replies.last_page
    ) {
      setReplyPage((prev) => prev + 1);
    } else {
      setReplyHasMore(false);
    }
  };

  const handleEditReply = (reply: Reply) => {
    setIsEditingReply(reply.id);
    setEditingReplyContent(reply.content);
  };

  const handleCancelEdit = () => {
    setIsEditingReply(null);
    setEditingReplyContent("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!discussion) {
    return <div className="text-center py-8">Discussion not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to discussions
        </Button>
      </div>

      {/* One box for discussion and replies */}
      <div className="bg-white dark:bg-gray-800 border border-brand-border rounded-none p-6">
        {/* Discussion Details */}
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={discussion.user.profile_photo_url} />
              <AvatarFallback>{discussion.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{discussion.user.name}</h3>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(discussion.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1">{discussion.title}</h2>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {discussion.content}
              </p>
              {discussion.image?.url && (
                <img
                  src={discussion.image.url}
                  alt="Discussion"
                  className="mt-4 rounded-none max-h-64 object-cover border border-brand-border"
                />
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-4 ml-10 sm:ml-12">
            {discussion.replies.data.length} Replies
          </h3>
          <div className="space-y-4 mb-6">
            {discussion.replies.data.map((reply) => (
              <div
                key={reply.id}
                className="flex space-x-3 items-start ml-8 sm:ml-12"
              >
                <Avatar className="h-8 w-8">
                  {/* <AvatarImage src={reply.user.profile_photo_url} />
                <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback> */}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* <span className="font-medium">{reply.user.name}</span> */}
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(reply.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReply(reply)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReply.mutate(reply.id)}
                        disabled={deleteReply.isPending}
                      >
                        {deleteReply.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isEditingReply === reply.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editingReplyContent}
                        onChange={(e) => setEditingReplyContent(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateReply.mutate(reply.id)}
                          disabled={
                            !editingReplyContent.trim() || updateReply.isPending
                          }
                        >
                          {updateReply.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm mt-1">{reply.content}</p>
                      {reply.image?.url && (
                        <img
                          src={reply.image.url}
                          alt="Reply"
                          className="mt-2 rounded-none max-h-48 object-cover border border-brand-border"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Replies Button */}
          {replyHasMore && discussion.replies.data.length > 0 && (
            <div className="flex justify-center mb-6">
              <Button
                onClick={loadMoreReplies}
                variant="outline"
                disabled={isLoading}
                className="rounded-none"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Load More Replies
              </Button>
            </div>
          )}

          {/* Reply Form */}
          <div className="space-y-2 ml-8 sm:ml-12">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setReplyImage(e.target.files[0]);
                  }
                }}
                className="max-w-xs"
              />
              <Button
                onClick={() => createReply.mutate()}
                disabled={!replyContent.trim() || createReply.isPending}
                className="flex-1 rounded-none"
              >
                {createReply.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Post Reply
              </Button>
            </div>
            {replyImage && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  {replyImage.name}
                  <button
                    onClick={() => setReplyImage(null)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetailPage;
