import clsx from "clsx";

const Badge = ({ children, variant = "default", size = "md", className }) => {
  const variants = {
    default: "bg-blue-300/20 text-blue-300 border-blue-300/30",
    success: "bg-green-500/20 text-green-400 border-green-400/30",
    warning: "bg-yellow-300/20 text-yellow-300 border-yellow-300/30",
    danger: "bg-red-500/20 text-red-400 border-red-400/30",
    purple: "bg-violet-300/20 text-violet-300 border-violet-300/30",
    todo: "bg-gray-500/20 text-gray-900 border-gray-400",
    in_progress: "bg-blue-500/20 text-blue-900 border-blue-300/30",
    done: "bg-green-500/20 text-green-400 border-green-400/30",
    low: "bg-gray-500/20 text-gray-600 border-gray-400/30",
    medium: "bg-yellow-300/20 text-yellow-200 border-yellow-300/30",
    high: "bg-red-500/20 text-red-900 border-red-400/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border font-general uppercase tracking-wide",
        "transition-all duration-300 hover:scale-105",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
