import {
  Users,
  UserCheck,
  Briefcase,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const AdminStatsCard = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    {
      label: "Total Users",
      value: stats.users?.total || 0,
      icon: Users,
      gradient: "from-blue-600 to-indigo-600",
      ring: "ring-blue-100",
      text: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Verified Users",
      value: stats.users?.verified || 0,
      icon: UserCheck,
      gradient: "from-emerald-600 to-green-600",
      ring: "ring-emerald-100",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Tasks",
      value: stats.tasks?.total || 0,
      icon: Briefcase,
      gradient: "from-purple-600 to-fuchsia-600",
      ring: "ring-purple-100",
      text: "text-purple-700",
      bg: "bg-purple-50",
    },
    {
      label: "New This Week",
      value: stats.users?.newThisWeek || 0,
      icon: TrendingUp,
      gradient: "from-orange-600 to-amber-600",
      ring: "ring-orange-100",
      text: "text-orange-700",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Admin Overview</h2>
          <p className="text-sm text-gray-500">Quick stats of your platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-gray-100 to-transparent blur-2xl opacity-70" />

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.label}</p>
                  <h3 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
                    {item.value}
                  </h3>
                </div>

                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} ${item.ring} ring-1 flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${item.text}`} />
                </div>
              </div>

              <div className="mt-5 relative z-10">
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                    style={{
                      width: `${Math.min(100, Math.max(18, item.value % 100))}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    Updated live
                  </span>
                  <span className="font-medium text-gray-700">Dashboard</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminStatsCard;
