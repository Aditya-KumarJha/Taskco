import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap";
import { toast } from "react-toastify";
import AnimatedTitle from "../components/animations/AnimatedTitle";
import NotificationList from "../components/notifications/NotificationList";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../store/notificationSlice";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notifications);
  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    gsap.fromTo(
      ".notifications-hero",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    gsap.to(".float-element", {
      y: -15,
      duration: 2.5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      stagger: 0.4,
    });
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap();
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error(error.message || "Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error.message || "Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      toast.success("Notification deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete notification");
    }
  };

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-blue-50 to-blue-75 py-20"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="float-element absolute left-10 top-20 size-64 rounded-full bg-gradient-to-br from-violet-300/10 to-transparent blur-3xl" />
        <div className="float-element absolute right-10 top-60 size-72 rounded-full bg-gradient-to-br from-yellow-300/10 to-transparent blur-3xl" />
        <div className="float-element absolute bottom-40 left-1/3 size-56 rounded-full bg-gradient-to-br from-blue-300/10 to-transparent blur-3xl" />
      </div>

      <div className="container mt-10 relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="notifications-hero mb-12 text-center">
          <AnimatedTitle
            title="N<b>o</b>tific<b>a</b>tions"
            containerClass="mb-6"
          />
          <p className="mx-auto max-w-2xl font-circular-web text-lg lg:text-xl text-black">
            Stay updated with all your task activities and important updates in one
            place.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-black/40 to-black/20 p-6 backdrop-blur-md shadow-2xl md:p-10">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-300/5 via-transparent to-yellow-300/5" />

            <NotificationList
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: "🔔",
                title: "Real-time Updates",
                description: "Get notified instantly",
              },
              {
                icon: "✅",
                title: "Track Progress",
                description: "See task completions",
              },
              {
                icon: "🗂️",
                title: "Stay Organized",
                description: "Manage all notifications",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group rounded-xl border border-black bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-violet-300/30 hover:from-violet-300/10"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-3 text-4xl">{item.icon}</div>
                <h3 className="mb-2 font-general text-sm uppercase tracking-wide text-black">
                  {item.title}
                </h3>
                <p className="font-circular-web text-xs text-black/60">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotificationPage;
