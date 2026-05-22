"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface StageCompleteProps {
  sentence: string;
  currentStage: number;
  totalStages: number;
  onContinue: () => void;
  language: "en" | "ar";
}

export function StageComplete({
  sentence,
  currentStage,
  totalStages,
  onContinue,
  language,
}: StageCompleteProps) {
  // Auto-continue after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onContinue]);

  const successText = language === "ar" ? "أحسنت!" : "Well done!";
  const stageText =
    language === "ar"
      ? `القطار ${currentStage} من ${totalStages}`
      : `Train ${currentStage} of ${totalStages}`;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-50 flex flex-col items-center justify-center p-6"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
      >
        <svg
          className="w-14 h-14 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>

      {/* Success Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-purple-800 mb-4 flex items-center gap-2">
          <span>{successText}</span>
          <span className="text-3xl">🎉</span>
        </h1>

        {/* Completed Sentence */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-purple-100 px-8 py-4 rounded-2xl mb-4"
        >
          <p className="text-xl text-purple-800 font-medium">{sentence}</p>
        </motion.div>

        {/* Stage Counter */}
        <p className="text-gray-500">{stageText}</p>
      </motion.div>

      {/* Click to continue hint */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onContinue}
        className="mt-8 text-purple-600 hover:text-purple-800 cursor-pointer flex items-center gap-2"
      >
        <span className="text-2xl">👆</span>
      </motion.button>
    </div>
  );
}
