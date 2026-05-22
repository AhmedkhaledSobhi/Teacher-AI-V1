"use client";

import { useState } from "react";

import { TrainIcon } from "./icons/train-icon";

type FilterType = "all" | "languages" | "science";

interface GamesSelectionProps {
  onGameSelect: (game: "train" | "classification") => void;
}

export function GamesSelection({ onGameSelect }: GamesSelectionProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const games = [
    {
      id: "train" as const,
      title: "قطار الجمل",
      description:
        "رتب الكلمات المبعثرة لتكوين جمل مفيدة. اختر لغتك وابدأ التحدي!",
      category: "languages",
      badge: "3 جمل مختلفة",
      badgeColor: "text-purple-600 bg-purple-50",
      playButtonColor: "bg-rose-500 hover:bg-rose-600",
      image: <TrainIcon />,
      categoryIcon: <i className="tabler-language text-lg" />,
      categoryLabel: "لغات",
    },
    {
      id: "classification" as const,
      title: "التصنيف الذكي",
      description:
        "صنف الحيوانات والكائنات حسب بيئتها أو نوعها في الصناديق الصحيحة.",
      category: "science",
      badge: "5 تصنيفات علمية",
      badgeColor: "text-purple-600 bg-purple-50",
      playButtonColor: "bg-emerald-500 hover:bg-emerald-600",
      image: null,
      categoryIcon: <i className="tabler-flask text-lg" />,
      categoryLabel: "علوم",
    },
  ];

  const filteredGames = games.filter((game) => {
    if (filter === "all") return true;
    return game.category === filter;
  });

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white"
      dir="rtl"
    >
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-purple-800 mb-3">
            مرحباً بك في ساحة الألعاب!
          </h1>
          <p className="text-gray-600 text-lg">
            ضاعف استيعابك للمواد عبر تحديات ممتعة تجعل تعلمك أسهل
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2.5 rounded-full font-medium transition-all ${
              filter === "all"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter("languages")}
            className={`px-6 py-2.5 rounded-full font-medium transition-all ${
              filter === "languages"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            لغات
          </button>
          <button
            onClick={() => setFilter("science")}
            className={`px-6 py-2.5 rounded-full font-medium transition-all ${
              filter === "science"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            علوم
          </button>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Image Area */}
              <div
                className={`h-56 flex items-center justify-center relative ${
                  game.id === "train"
                    ? "bg-purple-50/50"
                    : "bg-gradient-to-br from-green-50 to-teal-50"
                }`}
              >
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 text-sm text-gray-600 shadow-sm">
                  {game.categoryIcon}
                  <span>{game.categoryLabel}</span>
                </div>

                {/* Game Image/Icon */}
                {game.image}
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-purple-800 mb-2">
                  {game.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {game.description}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onGameSelect(game.id)}
                    className={`w-12 h-12 rounded-full ${game.playButtonColor} text-white flex items-center justify-center shadow-md transition-transform hover:scale-105`}
                  >
                    <i className="tabler-player-play-filled text-xl" />
                  </button>

                  <span
                    className={`text-sm px-4 py-2 rounded-full ${game.badgeColor} font-medium`}
                  >
                    {game.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
