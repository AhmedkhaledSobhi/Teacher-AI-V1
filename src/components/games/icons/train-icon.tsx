"use client";

import { motion } from "framer-motion";

interface TrainIconProps {
  className?: string;
  animate?: boolean;
}

export function TrainIcon({ className = "", animate = false }: TrainIconProps) {
  return (
    <motion.svg
      viewBox="0 0 300 120"
      className={`w-64 h-auto ${className}`}
      initial={false}
      animate={animate ? { x: [0, 10, 0] } : undefined}
      transition={
        animate
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
    >
      {/* Cart 1 */}
      <g transform="translate(0, 30)">
        <rect
          x="10"
          y="15"
          width="50"
          height="40"
          rx="6"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        <circle
          cx="20"
          cy="60"
          r="8"
          fill="#1f2937"
        />
        <circle
          cx="50"
          cy="60"
          r="8"
          fill="#1f2937"
        />
        <circle
          cx="20"
          cy="60"
          r="3"
          fill="#6b7280"
        />
        <circle
          cx="50"
          cy="60"
          r="3"
          fill="#6b7280"
        />
      </g>

      {/* Cart 2 */}
      <g transform="translate(60, 30)">
        <rect
          x="10"
          y="15"
          width="50"
          height="40"
          rx="6"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        <circle
          cx="20"
          cy="60"
          r="8"
          fill="#1f2937"
        />
        <circle
          cx="50"
          cy="60"
          r="8"
          fill="#1f2937"
        />
        <circle
          cx="20"
          cy="60"
          r="3"
          fill="#6b7280"
        />
        <circle
          cx="50"
          cy="60"
          r="3"
          fill="#6b7280"
        />
      </g>

      {/* Cart 3 */}
      <g transform="translate(120, 30)">
        <rect
          x="10"
          y="15"
          width="50"
          height="40"
          rx="6"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        <circle
          cx="20"
          cy="60"
          r="8"
          fill="#1f2937"
        />
        <circle
          cx="50"
          cy="60"
          r="8"
          fill="#1f2937"
        />
        <circle
          cx="20"
          cy="60"
          r="3"
          fill="#6b7280"
        />
        <circle
          cx="50"
          cy="60"
          r="3"
          fill="#6b7280"
        />
      </g>

      {/* Engine */}
      <g transform="translate(180, 0)">
        {/* Engine body */}
        <rect
          x="10"
          y="30"
          width="80"
          height="50"
          rx="8"
          fill="#7c3aed"
        />
        {/* Roof */}
        <rect
          x="20"
          y="20"
          width="60"
          height="15"
          rx="4"
          fill="#7c3aed"
        />
        {/* Chimney */}
        <rect
          x="25"
          y="5"
          width="15"
          height="20"
          rx="3"
          fill="#1f2937"
        />
        {/* Windows */}
        <rect
          x="30"
          y="35"
          width="20"
          height="15"
          rx="3"
          fill="#93c5fd"
        />
        <rect
          x="55"
          y="35"
          width="20"
          height="15"
          rx="3"
          fill="#93c5fd"
        />
        {/* Light */}
        <circle
          cx="85"
          cy="50"
          r="6"
          fill="#fbbf24"
        />
        <circle
          cx="85"
          cy="50"
          r="3"
          fill="#fef08a"
        />
        {/* Wheels */}
        <circle
          cx="35"
          cy="85"
          r="12"
          fill="#1f2937"
        />
        <circle
          cx="65"
          cy="85"
          r="12"
          fill="#1f2937"
        />
        <circle
          cx="35"
          cy="85"
          r="5"
          fill="#6b7280"
        />
        <circle
          cx="65"
          cy="85"
          r="5"
          fill="#6b7280"
        />
      </g>
    </motion.svg>
  );
}
