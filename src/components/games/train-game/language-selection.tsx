"use client";

import { TrainIcon } from "../icons/train-icon";

interface LanguageSelectionProps {
  onSelectLanguage: (language: "en" | "ar") => void;
  error?: string | null;
}

export function LanguageSelection({
  onSelectLanguage,
  error,
}: LanguageSelectionProps) {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-50 flex flex-col items-center justify-center p-6"
      dir="rtl"
    >
      {/* Train Icon */}
      <div className="mb-8">
        <TrainIcon className="w-48" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-purple-800 mb-10">
        اختر لغة اللعبة
      </h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Language Cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl">
        {/* English Card */}
        <div
          onClick={() => onSelectLanguage("en")}
          className="flex-1 bg-amber-50 border-3 border-amber-400 rounded-3xl p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] flex flex-col items-center"
          style={{ borderWidth: "3px" }}
        >
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <i className="tabler-language text-3xl text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">English</h2>
          <p className="text-amber-700 mb-6">Arrange English sentences</p>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-3 rounded-full font-medium transition-colors shadow-md">
            Start
          </button>
        </div>

        {/* Arabic Card */}
        <div
          onClick={() => onSelectLanguage("ar")}
          className="flex-1 bg-rose-50 border-3 border-rose-400 rounded-3xl p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] flex flex-col items-center"
          style={{ borderWidth: "3px" }}
        >
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
            <i className="tabler-book text-3xl text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-purple-800 mb-2">لغتي</h2>
          <p className="text-rose-700 mb-6">رتب الجمل بالعربية</p>
          <button className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-3 rounded-full font-medium transition-colors shadow-md">
            إبدأ
          </button>
        </div>
      </div>
    </div>
  );
}
