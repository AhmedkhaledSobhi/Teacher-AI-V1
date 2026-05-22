"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface GameCelebrationProps {
  onPlayAgain: () => void;
  onChangeLanguage: () => void;
  onBackToGames: () => void;
  language: "en" | "ar";
}

export function GameCelebration({
  onPlayAgain,
  onChangeLanguage,
  onBackToGames,
  language,
}: GameCelebrationProps) {
  const confettiRef = useRef(false);

  useEffect(() => {
    if (confettiRef.current) return;
    confettiRef.current = true;

    // Initial burst
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#7c3aed", "#f59e0b", "#10b981", "#ec4899", "#3b82f6"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#7c3aed", "#f59e0b", "#10b981", "#ec4899", "#3b82f6"],
      });
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const texts = {
    ar: {
      title: "أحسنت يا بطل!",
      subtitle: "أكملت جميع الجمل بنجاح",
      playAgain: "العب مجدداً",
      changeLanguage: "غيّر اللغة",
      backToGames: "ساحة الألعاب",
    },
    en: {
      title: "Great job, champion!",
      subtitle: "You completed all sentences successfully",
      playAgain: "Play Again",
      changeLanguage: "Change Language",
      backToGames: "Games Arena",
    },
  };

  const t = texts[language];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 flex flex-col items-center justify-center p-6 relative overflow-hidden"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Background bokeh effects */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-white/10 rounded-full blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative z-10 mb-6"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl"
        >
          🏆
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
          <span className="text-4xl">🎉</span>
          <span>{t.title}</span>
          <span className="text-4xl">🎉</span>
        </h1>
        <p className="text-purple-200 text-lg flex items-center justify-center gap-2">
          <span>{t.subtitle}</span>
          <span>🚀</span>
        </p>
      </motion.div>

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2 my-8 relative z-10"
      >
        {[1, 2, 3].map((star) => (
          <motion.span
            key={star}
            className="text-5xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 0.5,
              delay: 0.5 + star * 0.1,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            ⭐
          </motion.span>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap justify-center gap-4 relative z-10"
      >
        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-8 py-4 rounded-full font-medium shadow-lg transition-all hover:scale-105"
        >
          <i className="tabler-refresh text-xl" />
          <span>{t.playAgain}</span>
        </button>

        {/* Change Language Button */}
        <button
          onClick={onChangeLanguage}
          className="flex items-center gap-2 bg-white hover:bg-gray-100 text-purple-700 px-8 py-4 rounded-full font-medium shadow-lg transition-all hover:scale-105"
        >
          <i className="tabler-world text-xl" />
          <span>{t.changeLanguage}</span>
        </button>

        {/* Back to Games Button */}
        <button
          onClick={onBackToGames}
          className="flex items-center gap-2 bg-purple-500/50 hover:bg-purple-500/70 text-white px-8 py-4 rounded-full font-medium shadow-lg transition-all hover:scale-105 backdrop-blur-sm"
        >
          <span>{t.backToGames}</span>
          <i className="tabler-device-gamepad-2 text-xl" />
        </button>
      </motion.div>

      {/* Floating decorations */}
      <motion.div
        className="absolute top-10 left-10 text-4xl"
        animate={{ y: [0, -20, 0], rotate: [-10, 10, -10] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🎊
      </motion.div>
      <motion.div
        className="absolute top-20 right-20 text-4xl"
        animate={{ y: [0, -15, 0], rotate: [10, -10, 10] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      >
        🎉
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-20 text-3xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        ⭐
      </motion.div>
      <motion.div
        className="absolute top-1/4 right-10 text-3xl"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
      >
        🚂
      </motion.div>
    </div>
  );
}
