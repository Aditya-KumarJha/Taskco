import { useRef, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import gsap from "gsap";
import Card from "../ui/Card";

const NotificationCard = ({ notification, onMarkAsRead, onDelete, index = 0 }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    // Stagger animation on mount
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        x: -50,
        scale: 0.95,
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.6,
        delay: index * 0.08,
        ease: "back.out(1.7)",
      }
    );
  }, [index]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_created":
        return (
          <div className="rounded-full bg-blue-300/20 p-3">
            <svg
              className="size-6 text-blue-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        );
      case "task_updated":
        return (
          <div className="rounded-full bg-yellow-300/20 p-3">
            <svg
              className="size-6 text-yellow-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
        );
      case "task_completed":
        return (
          <div className="rounded-full bg-green-400/20 p-3">
            <svg
              className="size-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case "task_deleted":
        return (
          <div className="rounded-full bg-red-400/20 p-3">
            <svg
              className="size-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-violet-300/20 p-3">
            <svg
              className="size-6 text-violet-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div ref={cardRef}>
      <Card
        className={`group relative transition-all duration-300 ${
          !notification.read ? "border-violet-300/40 bg-gradient-to-br from-violet-300/10 to-black/20" : ""
        }`}
      >
        {/* Unread indicator */}
        {!notification.read && (
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-violet-300" />
        )}

        <div className="flex gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="font-general text-base text-white">
              {notification.message}
            </p>
            <p className="mt-1 font-circular-web text-sm text-white/50">
              {(() => {
                try {
                  return formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  });
                } catch {
                  return "Recently";
                }
              })()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-start gap-2">
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification._id);
                }}
                className="rounded-full p-2 text-violet-300 transition-all duration-300 hover:bg-violet-300/20"
                title="Mark as read"
              >
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification._id);
              }}
              className="rounded-full p-2 text-red-400 transition-all duration-300 hover:bg-red-400/20"
              title="Delete"
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationCard;
