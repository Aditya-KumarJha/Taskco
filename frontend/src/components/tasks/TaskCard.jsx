import { useRef, useEffect } from "react";
import { format } from "date-fns";
import gsap from "gsap";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

const TaskCard = ({ task, onClick, index = 0 }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 30,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay: index * 0.1,
        ease: "back.out(1.7)",
      }
    );
  }, [index]);

  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date();

  const statusLabels = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Completed",
  };

  const priorityIcons = {
    low: "⬇️",
    medium: "➡️",
    high: "⬆️",
  };

  return (
    <div ref={cardRef}>
      <Card
        hoverable
        onClick={onClick}
        className="group relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-300/10 via-transparent to-yellow-300/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div
          className={`absolute left-0 top-0 h-full w-1 ${
            task.priority === "high"
              ? "bg-red-500"
              : task.priority === "medium"
              ? "bg-yellow-300"
              : "bg-gray-500"
          }`}
        />

        <div className="ml-2">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 className="special-font flex-1 font-zentry text-xl font-black uppercase leading-tight text-white md:text-2xl">
              {task.title}
            </h3>
            <div className="flex gap-2">
              <Badge variant={task.status} size="sm">
                {statusLabels[task.status]}
              </Badge>
            </div>
          </div>

          {task.description && (
            <p className="mb-4 line-clamp-2 font-circular-web text-sm text-white/70">
              {task.description}
            </p>
          )}

          {task.imageUrl && (
            <div className="mb-4 overflow-hidden rounded-lg">
              <img
                src={task.imageUrl}
                alt={task.title}
                className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 font-circular-web text-xs text-white/60">
            <div className="flex items-center gap-1">
              <span>{priorityIcons[task.priority]}</span>
              <Badge variant={task.priority} size="sm">
                {task.priority}
              </Badge>
            </div>

            {task.dueDate && (
              <div
                className={`flex items-center gap-1 ${
                  isOverdue ? "text-red-400" : ""
                }`}
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{format(new Date(task.dueDate), "MMM dd, yyyy")}</span>
                {isOverdue && (
                  <Badge variant="danger" size="sm">
                    Overdue
                  </Badge>
                )}
              </div>
            )}

            <div className="ml-auto flex items-center gap-1 text-white/40">
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {(() => {
                  try {
                    return format(new Date(task.createdAt), "MMM dd");
                  } catch {
                    return "Recently";
                  }
                })()}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaskCard;
