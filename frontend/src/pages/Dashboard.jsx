import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap";
import AnimatedTitle from "../components/animations/AnimatedTitle";
import ProfileCard from "../components/dashboard/ProfileCard";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import Button from "../components/ui/Button";
import api from "../utils/api";
import { setLoggedOut } from "../store/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchTasks } from "../store/taskSlice";
import { fetchNotifications } from "../store/notificationSlice";
import { verifySession } from "../store/authSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.tasks);
  const { unreadCount } = useSelector((state) => state.notifications);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchTasks());
    dispatch(fetchNotifications());
    if (!user) {
      dispatch(verifySession());
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Hero animation
    gsap.fromTo(
      ".dashboard-hero",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    // Floating background animation
    gsap.to(".float-bg", {
      y: -20,
      x: 10,
      duration: 4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      stagger: 0.5,
    });
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (e) {
      // ignore network errors, still clear client state
    }
    dispatch(setLoggedOut());
    toast.success("Logout successful");
    navigate('/');
  };

  const handleProfileUpdate = (updatedUser) => {
    dispatch(verifySession());
  };

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-blue-50 to-blue-75 py-20"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="float-bg absolute left-10 top-10 size-96 rounded-full bg-gradient-to-br from-violet-300/10 to-transparent blur-3xl" />
        <div className="float-bg absolute right-10 top-1/3 size-[500px] rounded-full bg-gradient-to-br from-yellow-300/10 to-transparent blur-3xl" />
        <div className="float-bg absolute bottom-10 left-1/2 size-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-300/10 to-transparent blur-3xl" />
      </div>

      <div className="container mt-10 relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="dashboard-hero mb-12">
          <div className="mb-6 flex items-center justify-between">
            <AnimatedTitle
              title="D<b>a</b>shbo<b>a</b>rd"
              containerClass="!text-left !px-0"
            />
            <div className="">
              <Button
                onClick={handleLogout}
                title="Log out"
                containerClass="text-black"
              />
            </div>
          </div>

          <p className="max-w-3xl font-circular-web text-lg lg:text-xl text-black">
            Welcome back! Here's an overview of your tasks and activities.
          </p>

          {/* Quick Stats Banner */}
          {unreadCount > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-violet-300/40 bg-gradient-to-r from-violet-300/20 to-violet-300/5 px-6 py-3 backdrop-blur-sm">
              <div className="relative flex size-10 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-300 opacity-75"></span>
                <svg
                  className="relative size-6 text-violet-300"
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
              <span className="font-general text-sm uppercase tracking-wide text-violet-300">
                You have {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="mb-12">
          <ProfileCard user={user} onUpdate={handleProfileUpdate} />
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          <StatsCard stats={stats} />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <QuickActions />
        </div>

        {/* Recent Activity Card */}
        <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/40 to-black/20 p-8 backdrop-blur-sm">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-300/5 via-transparent to-yellow-300/5 rounded-2xl" />
          
          <h2 className="special-font mb-6 font-zentry text-2xl font-black uppercase text-white md:text-3xl">
            Your Progress
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Productivity Tips */}
            <div className="space-y-4">
              <h3 className="font-general text-sm uppercase tracking-wide text-violet-300">
                Productivity Tips
              </h3>
              <div className="space-y-3">
                {[
                  { icon: "🎯", text: "Break large tasks into smaller, manageable chunks" },
                  { icon: "⏰", text: "Set realistic deadlines to stay on track" },
                  { icon: "🔄", text: "Review and update tasks regularly" },
                  { icon: "✨", text: "Celebrate completing tasks to stay motivated" },
                ].map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-violet-300/30 hover:bg-violet-300/10"
                  >
                    <span className="text-2xl">{tip.icon}</span>
                    <p className="flex-1 font-circular-web text-sm text-white/80">
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Summary */}
            <div className="space-y-4">
              <h3 className="font-general text-sm uppercase tracking-wide text-yellow-300">
                Task Summary
              </h3>
              <div className="space-y-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-circular-web text-sm text-white/70">
                      Completion Rate
                    </span>
                    <span className="font-general text-lg font-bold text-green-400">
                      {stats?.total > 0
                        ? Math.round((stats.done / stats.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-300 transition-all duration-1000"
                      style={{
                        width: `${
                          stats?.total > 0
                            ? Math.round((stats.done / stats.total) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-yellow-300/20 bg-gradient-to-br from-yellow-300/10 to-transparent p-4">
                    <p className="font-general text-xs uppercase tracking-wide text-yellow-300">
                      Active Tasks
                    </p>
                    <p className="special-font mt-1 font-zentry text-3xl font-black text-white">
                      {(stats?.todo || 0) + (stats?.in_progress || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-400/20 bg-gradient-to-br from-green-400/10 to-transparent p-4">
                    <p className="font-general text-xs uppercase tracking-wide text-green-400">
                      Completed
                    </p>
                    <p className="special-font mt-1 font-zentry text-3xl font-black text-white">
                      {stats?.done || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
