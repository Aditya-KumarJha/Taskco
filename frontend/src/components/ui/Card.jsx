import clsx from "clsx";

const Card = ({ children, className, onClick, hoverable = false }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "relative rounded-2xl border border-white/20 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm p-6 transition-all duration-300",
        hoverable && "cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-300/20",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
