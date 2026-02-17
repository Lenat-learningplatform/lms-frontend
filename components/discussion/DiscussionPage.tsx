"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Calendar, MessageSquare, User } from "lucide-react"; // Import icons

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DiscussionForm from "./DiscussionForm";
import { useCoursePermissions } from "@/hooks/useHasPermission";

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  replies: {
    data: any[];
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

type DiscussionPageProps = {
  classId: string;
};

const DiscussionPage: React.FC<DiscussionPageProps> = ({ classId }) => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [renderedDiscussion, setRenderedDiscussion] = useState<Discussion[]>([]);
  const { canReadDiscussion, canCreateDiscussion } = useCoursePermissions();
  const {
    data: discussions,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["discussions", classId, page],
    queryFn: async () => {
      const response = await api.get(
        `/get-discussions/${classId}?page=${page}`
      );
      return response.data.data as {
        data: Discussion[];
        current_page: number;
        last_page: number;
      };
    },
  });

  useEffect(() => {
    if (discussions) {
      if (page === 1) {
        setRenderedDiscussion(discussions.data);
      } else {
        setRenderedDiscussion((prev) => [...prev, ...discussions.data]);
      }
      setHasMore(discussions.current_page < discussions.last_page);
    }
  }, [discussions, page]);

  const loadMore = () => {
    if (discussions && discussions.current_page < discussions.last_page) {
      setPage((prev) => prev + 1);
    } else {
      setHasMore(false);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load discussions
      </div>
    );
  }
  if (!canReadDiscussion) {
    return (
      <div className="text-center text-red-500 py-8">
        You do not have permission to view discussions
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {canCreateDiscussion && (
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => setIsModalOpen(true)}>
            Start New Discussion
          </Button>
        </div>
      )}

      {/* Discussion Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Discussion</DialogTitle>
          </DialogHeader>
          <DiscussionForm
            classId={classId}
            handleClose={() => {
              setIsModalOpen(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Discussions List */}
      <div className="space-y-6">
        {renderedDiscussion.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No discussions yet. Start one!</p>
          </div>
        ) : (
          renderedDiscussion.map((discussion) => (
            <div
              key={discussion.id}
              className="bg-white border border-brand-border rounded-lg p-6"
            >
              <Link href={`/discussion/${discussion.id}`}>
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={discussion.user.profile_photo_url} />
                    <AvatarFallback>
                      {discussion.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {/* User Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-[#3BD07A]" />
                      <h3 className="font-semibold">{discussion.user.name}</h3>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(discussion.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {/* Title */}
                    <h2 className="text-xl font-bold mt-1">
                      {discussion.title}
                    </h2>
                    {/* Content */}
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                      {discussion.content}
                    </p>
                    {/* Image */}
                    {discussion.image?.url && (
                      <img
                        src={discussion.image.url}
                        alt="Discussion"
                        className="mt-4 rounded-lg max-h-64 object-cover border border-brand-border"
                      />
                    )}
                    {/* Replies */}
                    <div className="flex items-center mt-4 text-sm text-gray-500">
                      <MessageSquare className="h-5 w-5 text-[#3BD07A] mr-2" />
                      <span>{discussion.replies.data.length} replies</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && discussions?.data?.length && (
        <div className="border border-brand-border p-2 mt-2 flex justify-center rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={isLoading}
            className="w-full rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiscussionPage;
