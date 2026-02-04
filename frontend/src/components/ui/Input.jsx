import clsx from "clsx";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block font-general text-sm uppercase tracking-wide text-white/90">
          {label}
          {required && <span className="ml-1 text-yellow-300">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(
          "w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3",
          "font-circular-web text-white placeholder-white/40",
          "transition-all duration-300",
          "focus:border-violet-300 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-violet-300/30",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 font-circular-web text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
