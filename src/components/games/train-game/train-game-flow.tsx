"use client";

import { useState, useEffect, useCallback } from "react";
import { LanguageSelection } from "./language-selection";
import { TrainLoader } from "./train-loader";
import { TrainGamePlay } from "./train-game-play";
import { StageComplete } from "./stage-complete";
import { GameCelebration } from "./game-celebration";
import { GameLanguage } from "@/views/apps/games";
import api from "@/utils/api";

interface Puzzle {
  stage: number;
  original_sentence: string;
  scrambled_parts: string[];
}

interface TrainGameFlowProps {
  selectedLanguage: GameLanguage;
  onLanguageSelect: (language: GameLanguage) => void;
  onBackToGames: () => void;
  onBackToLanguage: () => void;
}

type GameState =
  | "language"
  | "loading"
  | "playing"
  | "stageComplete"
  | "celebration";

export function TrainGameFlow({
  selectedLanguage,
  onLanguageSelect,
  onBackToGames,
  onBackToLanguage,
}: TrainGameFlowProps) {
  const [gameState, setGameState] = useState<GameState>("language");
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data fallback
  const getMockPuzzles = (language: "en" | "ar"): Puzzle[] => {
    if (language === "en") {
      return [
        {
          stage: 1,
          original_sentence: "The cat is sleeping",
          scrambled_parts: ["sleeping", "cat", "The", "is"],
        },
        {
          stage: 2,
          original_sentence: "I love learning",
          scrambled_parts: ["learning", "I", "love"],
        },
        {
          stage: 3,
          original_sentence: "Birds can fly high",
          scrambled_parts: ["fly", "Birds", "high", "can"],
        },
      ];
    }
    return [
      {
        stage: 1,
        original_sentence: "إن تدرس تنجح",
        scrambled_parts: ["تنجح", "تدرس", "إن"],
      },
      {
        stage: 2,
        original_sentence: "الشمس مشرقة اليوم",
        scrambled_parts: ["مشرقة", "اليوم", "الشمس"],
      },
      {
        stage: 3,
        original_sentence: "أنا أحب المدرسة",
        scrambled_parts: ["أحب", "المدرسة", "أنا"],
      },
    ];
  };

  const fetchPuzzles = useCallback(async (language: "en" | "ar") => {
    setIsLoading(true);
    setError(null);
    setGameState("loading");

    try {
      // Call the external API using the api utility
      const endpoint =
        language === "en"
          ? "/api/v1/games/sentence-train-en"
          : "/api/v1/games/sentence-train-ar";

      const data = await api.post<any>(endpoint, puzzles);

      if (data.puzzles && data.puzzles.length > 0) {
        setPuzzles(data.puzzles);
      } else {
        throw new Error("No puzzles returned from API");
      }

      setCurrentPuzzleIndex(0);

      // Wait for loader animation, then start playing
      setTimeout(() => {
        setGameState("playing");
        setIsLoading(false);
      }, 3000);
    } catch (err) {
      console.error("[v0] External API failed, using mock data:", err);

      // Fallback to mock data
      const mockPuzzles = getMockPuzzles(language);
      setPuzzles(mockPuzzles);
      setCurrentPuzzleIndex(0);

      // Still show the loader animation, then start playing with mock data
      setTimeout(() => {
        setGameState("playing");
        setIsLoading(false);
      }, 3000);
    }
  }, []);

  useEffect(() => {
    if (selectedLanguage && gameState === "language") {
      fetchPuzzles(selectedLanguage);
    }
  }, [selectedLanguage, gameState, fetchPuzzles]);

  const handleLanguageSelect = (language: "en" | "ar") => {
    onLanguageSelect(language);
  };

  const handleStageComplete = () => {
    setGameState("stageComplete");
  };

  const handleNextStage = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex((prev) => prev + 1);
      setGameState("playing");
    } else {
      setGameState("celebration");
    }
  };

  const handlePlayAgain = () => {
    if (selectedLanguage) {
      setCurrentPuzzleIndex(0);
      fetchPuzzles(selectedLanguage);
    }
  };

  const handleChangeLanguage = () => {
    onBackToLanguage();
    setGameState("language");
    setPuzzles([]);
    setCurrentPuzzleIndex(0);
  };

  const handleClose = () => {
    onBackToGames();
  };

  // Language selection
  if (!selectedLanguage || gameState === "language") {
    return (
      <LanguageSelection
        onSelectLanguage={handleLanguageSelect}
        error={error}
      />
    );
  }

  // Loading state
  if (gameState === "loading") {
    return <TrainLoader language={selectedLanguage} />;
  }

  // Stage complete
  if (gameState === "stageComplete" && puzzles[currentPuzzleIndex]) {
    return (
      <StageComplete
        sentence={puzzles[currentPuzzleIndex].original_sentence}
        currentStage={currentPuzzleIndex + 1}
        totalStages={puzzles.length}
        onContinue={handleNextStage}
        language={selectedLanguage}
      />
    );
  }

  // Celebration
  if (gameState === "celebration") {
    return (
      <GameCelebration
        onPlayAgain={handlePlayAgain}
        onChangeLanguage={handleChangeLanguage}
        onBackToGames={onBackToGames}
        language={selectedLanguage}
      />
    );
  }

  // Game play
  if (puzzles[currentPuzzleIndex]) {
    return (
      <TrainGamePlay
        puzzle={puzzles[currentPuzzleIndex]}
        currentStage={currentPuzzleIndex + 1}
        totalStages={puzzles.length}
        onComplete={handleStageComplete}
        onClose={handleClose}
        language={selectedLanguage}
      />
    );
  }

  return null;
}
