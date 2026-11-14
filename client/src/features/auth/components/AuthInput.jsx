const AuthInput = ({ label, type = "text", placeholder, ...props }) => {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="
            w-full
            rounded-xl
            border
            border-zinc-700
            bg-zinc-800
            px-5
            py-4
            text-white
            outline-none
            transition
            focus:border-indigo-500
            focus:ring-2
            focus:ring-indigo-500/30
          "
        {...props}
      />
    </div>
  );
};

export default AuthInput;
