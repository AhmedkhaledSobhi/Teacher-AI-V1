"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Puzzle {
  stage: number;
  original_sentence: string;
  scrambled_parts: string[];
}

interface TrainGamePlayProps {
  puzzle: Puzzle;
  currentStage: number;
  totalStages: number;
  onComplete: () => void;
  onClose: () => void;
  language: "en" | "ar";
}

const WORD_COLORS = [
  "bg-amber-100 border-amber-300 text-amber-800",
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-emerald-100 border-emerald-300 text-emerald-800",
  "bg-rose-100 border-rose-300 text-rose-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-cyan-100 border-cyan-300 text-cyan-800",
];

export function TrainGamePlay({
  puzzle,
  currentStage,
  totalStages,
  onComplete,
  onClose,
  language,
}: TrainGamePlayProps) {
  // Words at top (available to click)
  const [topWords, setTopWords] = useState<string[]>(puzzle.scrambled_parts);
  // Words placed in train carts
  const [trainWords, setTrainWords] = useState<string[]>([]);
  const [trainPosition, setTrainPosition] = useState(0);
  const [showStartBanner, setShowStartBanner] = useState(true);
  const [isTrainExiting, setIsTrainExiting] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const expectedWords = puzzle.original_sentence.split(" ");
  const totalWords = expectedWords.length;

  // Reset state when puzzle changes
  useEffect(() => {
    setTopWords(puzzle.scrambled_parts);
    setTrainWords([]);
    setTrainPosition(0);
    setShowStartBanner(true);
    setIsTrainExiting(false);
    setShowPlayButton(false);

    const timer = setTimeout(() => {
      setShowStartBanner(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [puzzle]);

  // Show play button when all words placed
  useEffect(() => {
    if (trainWords.length === totalWords && !isTrainExiting) {
      setShowPlayButton(true);
    } else {
      setShowPlayButton(false);
    }
  }, [trainWords.length, totalWords, isTrainExiting]);

  // Handle clicking word at top -> moves to train
  const handleTopWordClick = (word: string, index: number) => {
    if (isTrainExiting) return;

    // Remove from top
    setTopWords((prev) => {
      const newWords = [...prev];
      newWords.splice(index, 1);
      return newWords;
    });

    // Add to train
    setTrainWords((prev) => [...prev, word]);

    // Move train forward
    setTrainPosition((prev) => prev + 1);
  };

  // Handle clicking word on train -> returns to top
  const handleTrainWordClick = (word: string, index: number) => {
    if (isTrainExiting) return;

    // Remove from train
    setTrainWords((prev) => {
      const newWords = [...prev];
      newWords.splice(index, 1);
      return newWords;
    });

    // Add back to top
    setTopWords((prev) => [...prev, word]);

    // Move train backward
    setTrainPosition((prev) => Math.max(0, prev - 1));
  };

  // Handle play button click -> train exits
  const handlePlayClick = () => {
    // Check if order is correct
    const isCorrect = trainWords.every(
      (word, index) => word === expectedWords[index]
    );

    if (isCorrect) {
      setIsTrainExiting(true);
      setShowPlayButton(false);

      // Wait for train to exit, then complete
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      // Wrong order - shake or show error
      // For now, just reset
      setTopWords(puzzle.scrambled_parts);
      setTrainWords([]);
      setTrainPosition(0);
    }
  };

  const progress = (currentStage / totalStages) * 100;

  const hintText =
    language === "ar"
      ? "اسحب أو انقر على الكلمة لوضعها في العربة"
      : "Drag or click a word to place it in the cart";

  const startText = language === "ar" ? "انطلق!" : "Go!";

  return (
    <div
      className="h-screen w-screen fixed inset-0 overflow-hidden bg-gray-50"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/train-station-bg.jpg')`,
        }}
      />

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-gray-900">
        {/* Hint Button */}
        <button className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-200 transition-colors">
          <i className="tabler-bulb text-xl text-amber-600" />
        </button>

        {/* Progress */}
        <div className="flex-1 mx-4 flex items-center gap-3">
          <span className="text-sm font-medium text-white">
            {currentStage} / {totalStages}
          </span>
          <div className="flex-1 h-3 bg-purple-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalStages }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < currentStage ? "bg-purple-600" : "bg-purple-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          <i className="tabler-x text-xl text-gray-600" />
        </button>
      </div>

      {/* Game Area */}
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        {/* Answer Area at TOP (Speech Bubble with scrambled words) */}
        <div className="flex items-center justify-center pt-6 pb-2">
          <motion.div
            className="relative bg-white rounded-3xl shadow-xl px-8 py-5 min-w-[320px]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Speech bubble arrow pointing down */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white" />

            <div
              className="flex flex-wrap items-center justify-center gap-3"
              style={{ direction: language === "ar" ? "rtl" : "ltr" }}
            >
              <AnimatePresence mode="popLayout">
                {topWords.map((word, index) => (
                  <motion.button
                    key={`top-${word}-${index}`}
                    onClick={() => handleTopWordClick(word, index)}
                    className={`px-5 py-3 rounded-xl font-bold text-lg border-2 cursor-pointer hover:scale-105 transition-transform ${
                      WORD_COLORS[index % WORD_COLORS.length]
                    }`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, y: 50 }}
                    layout
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {word}
                  </motion.button>
                ))}
              </AnimatePresence>

              {topWords.length === 0 && trainWords.length > 0 && (
                <span className="text-gray-400 text-lg">
                  {language === "ar" ? "اضغط انطلق!" : "Click Go!"}
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Play Button (center, appears when all words placed) */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence>
            {showPlayButton && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handlePlayClick}
                className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
              >
                <i className="tabler-player-play-filled text-5xl text-gray-600" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Train Area at BOTTOM */}
        <div className="relative flex-shrink-0 h-44 mt-auto">
          {/* Tracks */}
          <div className="absolute bottom-0 left-0 right-0">
            {/* Rail */}
            <div className="absolute bottom-6 left-0 right-0 h-1.5 bg-gray-400" />
            {/* Ties */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-5 bg-amber-800 mx-0.5 rounded-sm"
                />
              ))}
            </div>
          </div>

          {/* Train Container */}
          <motion.div
            className="absolute bottom-8 flex items-end"
            style={{
              direction: language === "ar" ? "rtl" : "ltr",
              [language === "ar" ? "right" : "left"]: "5%",
            }}
            animate={{
              x: isTrainExiting
                ? language === "ar"
                  ? -1500
                  : 1500
                : trainPosition * 15 * (language === "ar" ? 1 : -1),
            }}
            transition={{
              type: isTrainExiting ? "tween" : "spring",
              duration: isTrainExiting ? 1.5 : undefined,
              stiffness: isTrainExiting ? undefined : 100,
              damping: isTrainExiting ? undefined : 20,
            }}
          >
            {/* Empty cart slots first */}
            {Array.from({ length: totalWords - trainWords.length }).map(
              (_, index) => (
                <motion.div
                  key={`empty-${index}`}
                  className="relative mx-1"
                >
                  <div className="w-20 h-14 rounded-xl border-2 border-dashed border-gray-400 bg-white/30 flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-bold">
                      {trainWords.length + index + 1}
                    </span>
                  </div>
                  {/* Wheels */}
                  <div className="absolute -bottom-2 left-2 w-4 h-4 bg-gray-500 rounded-full border-2 border-gray-400" />
                  <div className="absolute -bottom-2 right-2 w-4 h-4 bg-gray-500 rounded-full border-2 border-gray-400" />
                  {/* Connector */}
                  <div className="absolute top-1/2 -right-3 w-3 h-1 bg-gray-400" />
                </motion.div>
              )
            )}

            {/* Filled carts with words */}
            {trainWords.map((word, index) => (
              <motion.div
                key={`train-${word}-${index}`}
                className="relative mx-1"
                initial={{ scale: 0, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => handleTrainWordClick(word, index)}
                  className={`w-20 h-14 rounded-xl font-bold text-sm border-2 cursor-pointer flex items-center justify-center ${
                    WORD_COLORS[index % WORD_COLORS.length]
                  }`}
                >
                  {word}
                </button>
                {/* Wheels */}
                <div className="absolute -bottom-2 left-2 w-4 h-4 bg-gray-700 rounded-full border-2 border-gray-600" />
                <div className="absolute -bottom-2 right-2 w-4 h-4 bg-gray-700 rounded-full border-2 border-gray-600" />
                {/* Connector */}
                <div className="absolute top-1/2 -right-3 w-3 h-1 bg-gray-500" />
              </motion.div>
            ))}

            {/* Train Engine */}
            <motion.div
              className="relative mx-2"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <svg
                viewBox="0 0 120 90"
                className="w-24 h-auto"
              >
                {/* Main body */}
                <rect
                  x="10"
                  y="25"
                  width="80"
                  height="45"
                  rx="8"
                  fill="#7c3aed"
                />
                {/* Top */}
                <rect
                  x="20"
                  y="10"
                  width="55"
                  height="20"
                  rx="4"
                  fill="#7c3aed"
                />
                {/* Chimney */}
                <rect
                  x="25"
                  y="-5"
                  width="14"
                  height="20"
                  rx="3"
                  fill="#1f2937"
                />
                {/* Windows */}
                <rect
                  x="30"
                  y="32"
                  width="20"
                  height="15"
                  rx="3"
                  fill="#93c5fd"
                />
                <rect
                  x="55"
                  y="32"
                  width="20"
                  height="15"
                  rx="3"
                  fill="#93c5fd"
                />
                {/* Light */}
                <circle
                  cx="95"
                  cy="45"
                  r="6"
                  fill="#fbbf24"
                />
                {/* Wheels */}
                <circle
                  cx="35"
                  cy="75"
                  r="12"
                  fill="#1f2937"
                />
                <circle
                  cx="70"
                  cy="75"
                  r="12"
                  fill="#1f2937"
                />
                <circle
                  cx="35"
                  cy="75"
                  r="5"
                  fill="#6b7280"
                />
                <circle
                  cx="70"
                  cy="75"
                  r="5"
                  fill="#6b7280"
                />
                {/* Connector */}
                <rect
                  x="0"
                  y="45"
                  width="15"
                  height="6"
                  fill="#6b7280"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Hint Bar at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 bg-purple-50 px-6 py-2.5 rounded-full shadow-lg border border-purple-200"
      >
        <p className="text-purple-700 text-sm font-medium">{hintText}</p>
      </motion.div>

      {/* Start Banner */}
      <AnimatePresence>
        {showStartBanner && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center"
          >
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-16 py-8 rounded-3xl shadow-2xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <h2 className="text-5xl font-bold text-white">{startText}</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
