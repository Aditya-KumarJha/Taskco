import { FaGoogle, FaGithub } from "react-icons/fa";

const SocialButtons = ({ onClick }) => {
  const providers = [
    { name: "Google", icon: <FaGoogle /> },
    { name: "GitHub", icon: <FaGithub /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {providers.map((p) => (
        <button
          key={p.name}
          type="button"
          aria-label={`Sign up with ${p.name}`}
          onClick={() => onClick(p.name)}
          className="w-full flex items-center justify-center gap-2
                     border border-zinc-200 bg-white text-gray-900
                     hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-600 hover:text-white hover:border-transparent
                     transition-all rounded-lg py-3 active:scale-95 shadow-sm"
        >
          {p.icon}
          <span className="text-sm font-medium">{p.name}</span>
        </button>
      ))}
    </div>
  );
};

export default SocialButtons;
