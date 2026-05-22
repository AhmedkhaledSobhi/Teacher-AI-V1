"use client";

import React from "react";
import { useCoreUISound } from "@/hooks/useCoreUISound";

interface SubjectCardProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  onClick?: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  icon,
  title,
  color,
  onClick,
}) => {
  const { play } = useCoreUISound();

  const handleClick = () => {
    play("card-feature-click");
    onClick?.();
  };

  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      onClick={handleClick}
    >
      <div
        className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <span
        className="text-xs md:text-sm font-semibold text-center leading-tight"
        style={{ color: "var(--mui-palette-text-primary, #fff)" }}
      >
        {title}
      </span>
    </div>
  );
};

export default SubjectCard;
