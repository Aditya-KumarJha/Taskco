import { useRef, useEffect } from "react";
import gsap from "gsap";
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import Card from "../ui/Card";

const StatsCard = ({ stats }) => {
  const statsRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      ".stat-card",
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: "back.out(1.7)",
      }
    );
  }, []);

  const statItems = [
    {
      label: "Total Tasks",
      value: stats?.total || 0,
      icon: <HiOutlineClipboardList size={26} />,
      color: "from-blue-300/20 to-blue-300/5",
      borderColor: "border-blue-300/40",
      iconBg: "bg-blue-300/20 text-blue-500",
    },
    {
      label: "To Do",
      value: stats?.todo || 0,
      icon: <HiOutlineClock size={26} />,
      color: "from-gray-300/30 to-gray-300/10",
      borderColor: "border-gray-300/40",
      iconBg: "bg-gray-300/30 text-gray-700",
    },
    {
      label: "In Progress",
      value: stats?.in_progress || 0,
      icon: <HiOutlineLightningBolt size={26} />,
      color: "from-yellow-300/20 to-yellow-300/5",
      borderColor: "border-yellow-300/40",
      iconBg: "bg-yellow-300/30 text-yellow-600",
    },
    {
      label: "Completed",
      value: stats?.done || 0,
      icon: <HiOutlineCheckCircle size={26} />,
      color: "from-green-400/20 to-green-400/5",
      borderColor: "border-green-400/40",
      iconBg: "bg-green-400/30 text-green-600",
    },
  ];

  const completionRate =
    stats?.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div ref={statsRef}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="special-font font-zentry text-2xl font-black uppercase text-gray-900 md:text-3xl">
          Task Statistics
        </h2>
        <div className="rounded-full border border-green-400/40 bg-gradient-to-br from-green-400/20 to-green-400/5 px-4 py-2">
          <span className="font-general text-sm uppercase text-green-600">
            {completionRate}% Complete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statItems.map((item, index) => (
          <div key={index} className="stat-card">
            <Card
              className={`group relative overflow-hidden bg-gradient-to-br ${item.color} ${item.borderColor} border-2`}
            >
              <div
                className={`mb-3 inline-flex rounded-lg p-2 ${item.iconBg}`}
              >
                {item.icon}
              </div>

              <div className="special-font mb-1 font-zentry text-4xl font-black text-gray-900 md:text-5xl">
                {item.value}
              </div>

              <div className="font-general text-xs uppercase tracking-wide text-gray-600">
                {item.label}
              </div>

              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-xl`}
                />
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="stat-card mt-6">
        <Card className="bg-gradient-to-br from-violet-300/10 to-white/40">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-general text-sm uppercase text-gray-700">
              Overall Progress
            </span>
            <span className="font-general text-sm font-bold text-violet-500">
              {completionRate}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-green-400 transition-all duration-1000 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatsCard;
