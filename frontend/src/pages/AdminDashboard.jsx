import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminStats,
  fetchAllUsers,
  fetchAllTasks,
} from "../store/adminSlice";
import { setLoggedOut } from "../store/authSlice";
import api from "../utils/api";
import { toast } from "react-toastify";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  Sparkles,
  Activity,
  ShieldAlert,
} from "lucide-react";

import AdminStatsCard from "../components/admin/AdminStatsCard";
import UsersTable from "../components/admin/UsersTable";
import TasksTable from "../components/admin/TasksTable";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { stats, users, tasks, loading, pagination } = useSelector(
    (state) => state.admin
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [searchParams, setSearchParams] = useState({
    users: { page: 1, search: "" },
    tasks: { page: 1, search: "" },
  });

  useEffect(() => {
    const prev = document.title;
    document.title = "Taskco — Admin Dashboard";
    return () => (document.title = prev);
  }, []);

  useEffect(() => {
    if (!user) return;

    if (user.role !== "admin") {
      toast.error("Unauthorized access");
      navigate("/dashboard");
      return;
    }

    dispatch(fetchAdminStats());
    dispatch(fetchAllUsers(searchParams.users));
    dispatch(fetchAllTasks(searchParams.tasks));
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (e) {}
    dispatch(setLoggedOut());
    toast.success("Logout successful");
    navigate("/");
  };

  const handleUsersPageChange = (page) => {
    const newParams = { ...searchParams.users, page };
    setSearchParams((prev) => ({ ...prev, users: newParams }));
    dispatch(fetchAllUsers(newParams));
  };

  const handleTasksPageChange = (page) => {
    const newParams = { ...searchParams.tasks, page };
    setSearchParams((prev) => ({ ...prev, tasks: newParams }));
    dispatch(fetchAllTasks(newParams));
  };

  const handleUsersSearch = (search) => {
    const newParams = { ...searchParams.users, search, page: 1 };
    setSearchParams((prev) => ({ ...prev, users: newParams }));
    dispatch(fetchAllUsers(newParams));
  };

  const handleTasksSearch = (search) => {
    const newParams = { ...searchParams.tasks, search, page: 1 };
    setSearchParams((prev) => ({ ...prev, tasks: newParams }));
    dispatch(fetchAllTasks(newParams));
  };

  const tabItems = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "users", label: "Users", icon: Users },
      { id: "tasks", label: "Tasks", icon: ClipboardList },
    ],
    []
  );

  const taskStatusEntries = useMemo(() => {
    if (!stats?.tasks?.byStatus) return [];
    return Object.entries(stats.tasks.byStatus).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const providerEntries = useMemo(() => {
    if (!stats?.users?.byProvider) return [];
    return Object.entries(stats.users.byProvider).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const totalTasksByStatus = useMemo(() => {
    if (!taskStatusEntries.length) return 0;
    return taskStatusEntries.reduce((acc, [, count]) => acc + count, 0);
  }, [taskStatusEntries]);

  const totalUsersByProvider = useMemo(() => {
    if (!providerEntries.length) return 0;
    return providerEntries.reduce((acc, [, count]) => acc + count, 0);
  }, [providerEntries]);

  const formatStatus = (status) => {
    if (status === "in_progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatProvider = (provider) => {
    if (!provider) return "Unknown";
    if (provider === "google") return "Google";
    if (provider === "github") return "GitHub";
    if (provider === "email") return "Email";
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  const getStatusDot = (status) => {
    if (status === "done") return "bg-emerald-500";
    if (status === "in_progress") return "bg-blue-500";
    if (status === "todo") return "bg-gray-400";
    return "bg-gray-400";
  };

  const getProviderDot = (provider) => {
    if (provider === "google") return "bg-red-500";
    if (provider === "github") return "bg-gray-900";
    if (provider === "email") return "bg-blue-600";
    return "bg-gray-400";
  };

  if (!user || user.role !== "admin") return null;

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-10 size-96 rounded-full bg-gradient-to-br from-indigo-200/30 to-transparent blur-3xl" />
        <div className="absolute right-10 top-1/3 size-[520px] rounded-full bg-gradient-to-br from-emerald-200/20 to-transparent blur-3xl" />
        <div className="absolute bottom-10 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-200/20 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-gray-600 text-base md:text-lg max-w-2xl">
                Manage users, tasks, verification, and view platform activity in
                one place.
              </p>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-gray-200 text-sm text-gray-700 shadow-sm">
                <ShieldAlert className="w-4 h-4 text-gray-500" />
                Logged in as{" "}
                <span className="font-semibold text-gray-900">
                  {user.username || user.email || "Admin"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-800 font-semibold shadow-sm hover:bg-gray-50 active:scale-[0.98] transition w-full md:w-auto"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/70 border border-gray-200 shadow-sm w-full lg:w-auto overflow-x-auto">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition whitespace-nowrap ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 border border-gray-200 shadow-sm">
            <Activity className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              System Status:{" "}
              <span className="font-semibold text-gray-900">
                {loading ? "Refreshing..." : "Live"}
              </span>
            </span>
          </div>
        </div>

        {loading && !stats && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-700 font-semibold">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
              Loading admin data...
            </div>
          </div>
        )}

        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            <AdminStatsCard stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">
                      Task Status
                    </h3>
                    <p className="text-sm text-gray-500">
                      Distribution of tasks by status
                    </p>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold">
                    {totalTasksByStatus} total
                  </div>
                </div>

                <div className="space-y-4">
                  {taskStatusEntries.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No task stats available.
                    </div>
                  ) : (
                    taskStatusEntries.map(([status, count]) => {
                      const percent = totalTasksByStatus
                        ? Math.round((count / totalTasksByStatus) * 100)
                        : 0;

                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${getStatusDot(
                                  status
                                )}`}
                              />
                              <span className="text-sm font-semibold text-gray-800">
                                {formatStatus(status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                {percent}%
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {count}
                              </span>
                            </div>
                          </div>

                          <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">
                      User Providers
                    </h3>
                    <p className="text-sm text-gray-500">
                      Where your users are signing in from
                    </p>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold">
                    {totalUsersByProvider} total
                  </div>
                </div>

                <div className="space-y-4">
                  {providerEntries.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No provider stats available.
                    </div>
                  ) : (
                    providerEntries.map(([provider, count]) => {
                      const percent = totalUsersByProvider
                        ? Math.round((count / totalUsersByProvider) * 100)
                        : 0;

                      return (
                        <div key={provider}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${getProviderDot(
                                  provider
                                )}`}
                              />
                              <span className="text-sm font-semibold text-gray-800">
                                {formatProvider(provider)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                {percent}%
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {count}
                              </span>
                            </div>
                          </div>

                          <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-green-600"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {stats.topUsers && stats.topUsers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">
                      Top Users by Tasks
                    </h3>
                    <p className="text-sm text-gray-500">
                      Most active users based on created tasks
                    </p>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold">
                    {stats.topUsers.length} users
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.topUsers.map((u, index) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/40 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-sm">
                          {(u.fullName?.firstName?.[0] ||
                            u.username?.[0] ||
                            String(index + 1)
                          ).toUpperCase()}
                        </div>

                        <div>
                          <div className="font-bold text-gray-900 leading-tight">
                            {u.fullName?.firstName || u.username || "User"}{" "}
                            {u.fullName?.lastName || ""}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{u.username || "unknown"}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-gray-900">
                          {u.taskCount}
                        </div>
                        <div className="text-xs text-gray-500">tasks</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <UsersTable
            users={users}
            pagination={pagination?.users}
            onPageChange={handleUsersPageChange}
            onSearch={handleUsersSearch}
          />
        )}

        {activeTab === "tasks" && (
          <TasksTable
            tasks={tasks}
            pagination={pagination?.tasks}
            onPageChange={handleTasksPageChange}
            onSearch={handleTasksSearch}
          />
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
