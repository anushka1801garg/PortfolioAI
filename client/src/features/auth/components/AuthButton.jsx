import { motion } from "framer-motion";

const AuthButton = ({ children, ...props }) => {
  return (
    <motion.button
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className="
        mt-2
        w-full
        rounded-xl
        bg-indigo-600
        py-4
        font-semibold
        text-white
        transition
        hover:bg-indigo-500
      "
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AuthButton;
