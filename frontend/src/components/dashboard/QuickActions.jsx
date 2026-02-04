import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  HiPlus,
  HiOutlineClipboardList,
  HiOutlineBell,
  HiArrowRight,
} from "react-icons/hi";
import Card from "../ui/Card";

const QuickActions = () => {
  const actionsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(
      ".quick-action-card",
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
      }
    );
  }, []);

  const actions = [
    {
      title: "Create Task",
      description: "Add a new task to your list",
      icon: <HiPlus size={26} />,
      color: "from-violet-300/30 to-violet-300/10",
      borderColor: "border-violet-300/40",
      iconBg: "bg-violet-300/30 text-violet-600",
      arrowColor: "text-violet-600",
      onClick: () => navigate("/create-task"),
    },
    {
      title: "View Tasks",
      description: "See all your tasks",
      icon: <HiOutlineClipboardList size={26} />,
      color: "from-blue-300/30 to-blue-300/10",
      borderColor: "border-blue-300/40",
      iconBg: "bg-blue-300/30 text-blue-600",
      arrowColor: "text-blue-600",
      onClick: () => navigate("/tasks"),
    },
    {
      title: "Notifications",
      description: "Check your updates",
      icon: <HiOutlineBell size={26} />,
      color: "from-yellow-300/30 to-yellow-300/10",
      borderColor: "border-yellow-300/40",
      iconBg: "bg-yellow-300/30 text-yellow-600",
      arrowColor: "text-yellow-600",
      onClick: () => navigate("/notifications"),
    },
  ];

  return (
    <div ref={actionsRef}>
      <div className="mb-6">
        <h2 className="special-font font-zentry text-2xl font-black uppercase text-gray-900 md:text-3xl">
          Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {actions.map((action, index) => (
          <div key={index} className="quick-action-card">
            <Card
              hoverable
              onClick={action.onClick}
              className={`group relative cursor-pointer overflow-hidden bg-gradient-to-br ${action.color} ${action.borderColor} border-2`}
            >
              <div
                className={`mb-4 inline-flex rounded-lg p-3 ${action.iconBg}`}
              >
                {action.icon}
              </div>

              <h3 className="special-font mb-2 font-zentry text-xl font-black uppercase text-gray-900">
                {action.title}
              </h3>

              <p className="font-circular-web text-sm text-gray-600">
                {action.description}
              </p>

              <div className="absolute bottom-4 right-4 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                <HiArrowRight size={22} className={action.arrowColor} />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
