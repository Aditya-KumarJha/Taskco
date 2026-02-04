import clsx from "clsx";

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  placeholder = "Select an option",
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
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={clsx(
          "w-full cursor-pointer rounded-xl border border-white/20 bg-black/30 px-4 py-3",
          "font-circular-web text-white",
          "transition-all duration-300",
          "focus:border-violet-300 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-violet-300/30",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-black text-white/60">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-black text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 font-circular-web text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select;
