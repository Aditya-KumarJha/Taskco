import { useEffect, useRef } from "react";
import gsap from "gsap";
import NotificationCard from "./NotificationCard";
import Button from "../ui/Button";

const NotificationList = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  loading,
}) => {
  const headerRef = useRef(null);
  const emptyStateRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
      );
    }

    if (emptyStateRef.current) {
      gsap.fromTo(
        emptyStateRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
      );
    }
  }, [notifications.length]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="three-body">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div
        ref={emptyStateRef}
        className="flex min-h-[400px] flex-col items-center justify-center text-center"
      >
        <div className="mb-6 rounded-full bg-violet-300/10 p-8">
          <svg
            className="size-20 text-violet-300/50"
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
        <h3 className="special-font mb-2 font-zentry text-3xl font-black uppercase text-white">
          No Notifications
        </h3>
        <p className="font-circular-web text-white/60">
          You're all caught up! Check back later for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerRef}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="special-font font-zentry text-3xl font-black uppercase text-white md:text-4xl">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p className="mt-1 font-general text-sm uppercase text-violet-300">
              {unreadCount} Unread
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={onMarkAllAsRead}
            title="Mark All as Read"
            containerClass="bg-violet-300/20 text-violet-300 border border-violet-300/30 hover:bg-violet-300/30"
          />
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <NotificationCard
            key={notification._id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
