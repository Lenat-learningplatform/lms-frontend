"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import api from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  body: {
    message: string;
    url: string;
  };
  name: string;
  created_at: string;
  read_at: string | null;
}

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const response = await api.get(`/my-notifications?page=${page}`);
      return response.data;
    },
    enabled: isOpen,
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read");
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return api.post("/read-all-notifications");
    },
    onSuccess: () => {
      setUnreadCount(0);
      refetch();
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  // Load more notifications
  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  // Update notifications when data changes
  useEffect(() => {
    if (data) {
      setUnreadCount(data.data.unread_count);

      if (page === 1) {
        setNotifications(data.data.data.data);
      } else {
        setNotifications((prev) => [...prev, ...data.data.data.data]);
      }

      setHasMore(data.data.data.current_page < data.data.data.last_page);
    }
  }, [data, page]);

  // Reset when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setNotifications([]);
      setHasMore(true);
    } else {
      refetch();
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }
    // Optionally navigate to the notification URL
    // window.location.href = notification.body.url;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative hidden focus:ring-none focus:outline-none md:h-8 md:w-8 md:bg-secondary text-secondary-foreground rounded-full md:flex flex-col items-center justify-center"
        >
          <Icon
            icon="heroicons-outline:bell"
            className="animate-tada h-5 w-5"
          />
          {unreadCount > 0 && (
            <Badge
              className="w-4 h-4 p-0 text-[8px] rounded-full font-semibold items-center justify-center absolute left-[calc(100%-12px)] bottom-[calc(100%-10px)]"
              color="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[999] mx-4 lg:w-[320px] p-0"
      >
        <DropdownMenuLabel>
          <div className="flex justify-between px-4 py-3 border-b border-default-100">
            <div className="text-sm text-brand-dark font-medium">
              Notifications
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                >
                  {markAllAsRead.isPending ? "Marking..." : "Mark all as read"}
                </Button>
              )}
              {/* <Link
                href="/notifications"
                className="text-brand-dark text-xs underline"
              >
                View all
              </Link> */}
            </div>
          </div>
        </DropdownMenuLabel>
        <div className="h-[300px] xl:h-[350px] flex flex-col">
          <ScrollArea className="flex-1 pr-3">
            {isLoading && page === 1 ? (
              <div className="flex items-center justify-center p-4 h-full">
                <Icon
                  icon="heroicons-outline:refresh"
                  className="h-5 w-5 animate-spin"
                />
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center p-4 text-red-500 h-full">
                Failed to load notifications
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center p-4 text-brand-dark h-full">
                No notifications
              </div>
            ) : (
              <>
                {notifications.map((item) => (
                  <DropdownMenuItem
                    key={`notification-${item.id}`}
                    className={cn(
                      "flex gap-9 py-2 px-4 cursor-pointer group",
                      !item.read_at && "bg-secondary/50"
                    )}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <div className="flex-none">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {item.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <div className="text-sm text-brand-dark dark:group-hover:text-brand-dark font-normal truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-brand-dark dark:group-hover:text-brand-dark font-light line-clamp-2">
                          {item.body.message}
                        </div>
                        <div className="text-brand-dark dark:group-hover:text-brand-dark text-xs">
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                    {!item.read_at && (
                      <div className="flex-0">
                        <span className="h-[10px] w-[10px] bg-destructive border border-destructive-foreground dark:border-default-400 rounded-full inline-block" />
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </ScrollArea>
          {hasMore && notifications.length > 0 && (
            <div className="border-t border-default-100 p-2 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMore}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Icon
                    icon="heroicons-outline:refresh"
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
