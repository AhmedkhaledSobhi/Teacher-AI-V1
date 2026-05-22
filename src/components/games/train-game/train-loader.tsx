"use client";

import { motion } from "framer-motion";

interface TrainLoaderProps {
  language: "en" | "ar";
}

export function TrainLoader({ language }: TrainLoaderProps) {
  const text =
    language === "ar"
      ? "يتم تجهيز القطار الخاص بك..."
      : "Preparing your train...";

  // Colors for the carts
  const cartColors = ["#fef3c7", "#d1fae5", "#dbeafe"];

  return (
    <div
      className="h-screen w-screen fixed inset-0 flex flex-col items-center justify-center p-6 overflow-hidden bg-gray-50"
      dir="rtl"
    >
      {/* Animated Train with bouncing carts */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8 flex items-end"
        style={{ direction: "ltr" }}
      >
        {/* Train Carts - bounce up one by one */}
        {cartColors.map((color, index) => (
          <motion.div
            key={index}
            className="relative mx-1"
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          >
            {/* Cart body */}
            <div
              className="w-16 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <span className="text-gray-400 font-bold">{index + 1}</span>
            </div>
            {/* Wheels */}
            <div className="absolute -bottom-2 left-1 w-4 h-4 bg-gray-700 rounded-full" />
            <div className="absolute -bottom-2 right-1 w-4 h-4 bg-gray-700 rounded-full" />
          </motion.div>
        ))}

        {/* Train Engine */}
        <motion.svg
          viewBox="0 0 100 80"
          className="w-24 h-auto mx-2"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          {/* Engine body */}
          <rect
            x="5"
            y="15"
            width="70"
            height="45"
            rx="8"
            fill="#7c3aed"
          />
          {/* Roof */}
          <rect
            x="15"
            y="5"
            width="50"
            height="15"
            rx="4"
            fill="#7c3aed"
          />
          {/* Chimney */}
          <rect
            x="20"
            y="-5"
            width="12"
            height="15"
            rx="3"
            fill="#1f2937"
          />
          {/* Windows */}
          <rect
            x="25"
            y="22"
            width="18"
            height="14"
            rx="3"
            fill="#93c5fd"
          />
          <rect
            x="48"
            y="22"
            width="18"
            height="14"
            rx="3"
            fill="#93c5fd"
          />
          {/* Light */}
          <circle
            cx="75"
            cy="38"
            r="5"
            fill="#fbbf24"
          />
          {/* Wheels */}
          <circle
            cx="30"
            cy="65"
            r="10"
            fill="#1f2937"
          />
          <circle
            cx="60"
            cy="65"
            r="10"
            fill="#1f2937"
          />
          <circle
            cx="30"
            cy="65"
            r="4"
            fill="#6b7280"
          />
          <circle
            cx="60"
            cy="65"
            r="4"
            fill="#6b7280"
          />
        </motion.svg>
      </motion.div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white px-8 py-4 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-purple-800">{text}</h2>
      </motion.div>

      {/* Loading Dots */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-purple-600 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Track at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Rail */}
        <div className="absolute bottom-6 left-0 right-0 h-1.5 bg-gray-400" />
        {/* Ties */}
        <motion.div
          className="flex"
          animate={{ x: [-30, 0] }}
          transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-5 bg-amber-800 mx-0.5 rounded-sm flex-shrink-0"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
