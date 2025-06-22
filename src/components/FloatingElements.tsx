
import { motion } from "framer-motion";

const FloatingElements = () => {
  const elements = [
    {
      size: "w-32 h-32",
      gradient: "from-blue-400/20 to-purple-400/20",
      position: "top-20 left-10",
      delay: 0
    },
    {
      size: "w-24 h-24", 
      gradient: "from-pink-400/20 to-red-400/20",
      position: "top-40 right-20",
      delay: 2
    },
    {
      size: "w-40 h-40",
      gradient: "from-green-400/20 to-blue-400/20", 
      position: "bottom-40 left-1/4",
      delay: 4
    },
    {
      size: "w-28 h-28",
      gradient: "from-yellow-400/20 to-orange-400/20",
      position: "bottom-20 right-1/3", 
      delay: 6
    },
    {
      size: "w-36 h-36",
      gradient: "from-violet-400/20 to-pink-400/20",
      position: "top-1/2 left-5",
      delay: 1
    },
    {
      size: "w-20 h-20",
      gradient: "from-cyan-400/20 to-teal-400/20",
      position: "top-60 right-10",
      delay: 3
    }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + element.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: element.delay
          }}
          className={`absolute ${element.position} ${element.size} bg-gradient-to-r ${element.gradient} rounded-full blur-xl`}
        />
      ))}
      
      {/* Additional geometric shapes */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/3 right-1/4 w-16 h-16 border-2 border-purple-300/30 dark:border-purple-400/30 rounded-lg"
      />
      
      <motion.div
        animate={{
          rotate: [360, 0],
          y: [-5, 5, -5],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/3 left-1/3 w-12 h-12 border-2 border-blue-300/30 dark:border-blue-400/30 rotate-45"
      />
    </div>
  );
};

export default FloatingElements;
