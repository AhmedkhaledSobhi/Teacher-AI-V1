"use client";

import { useState } from "react";
import { GamesSelection } from "@/components/games/games-selection";
import { TrainGameFlow } from "@/components/games/train-game/train-game-flow";

export type GameType = "train" | "classification" | null;
export type GameLanguage = "en" | "ar" | null;

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<GameLanguage>(null);

  const handleGameSelect = (game: GameType) => {
    setSelectedGame(game);
  };

  const handleLanguageSelect = (language: GameLanguage) => {
    setSelectedLanguage(language);
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
    setSelectedLanguage(null);
  };

  const handleBackToLanguage = () => {
    setSelectedLanguage(null);
  };

  // Show games selection when no game is selected
  if (!selectedGame) {
    return <GamesSelection onGameSelect={handleGameSelect} />;
  }

  // Show train game flow
  if (selectedGame === "train") {
    return (
      <TrainGameFlow
        selectedLanguage={selectedLanguage}
        onLanguageSelect={handleLanguageSelect}
        onBackToGames={handleBackToGames}
        onBackToLanguage={handleBackToLanguage}
      />
    );
  }

  // Fallback - show games selection
  return <GamesSelection onGameSelect={handleGameSelect} />;
}
