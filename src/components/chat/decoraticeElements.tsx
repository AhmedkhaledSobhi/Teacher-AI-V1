export const StarDecor = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L13.5 9L20 10L13.5 11L12 18L10.5 11L4 10L10.5 9L12 2Z"
      fill="#FFD54F"
    />
  </svg>
);

export const SmallStar = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 1L9 6L14 7L9 8L8 13L7 8L2 7L7 6L8 1Z" fill="#FFD54F" />
  </svg>
);

export const TinyStar = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 0.5L6.75 4.5L10.5 5.25L6.75 6L6 10L5.25 6L1.5 5.25L5.25 4.5L6 0.5Z"
      fill="#FFD54F"
    />
  </svg>
);

export const CircleDecor = ({
  className,
  color = "#7C4DFF",
}: {
  className?: string;
  color?: string;
}) => (
  <div
    className={className}
    style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: color,
      opacity: 0.6,
    }}
  />
);

export const TriangleDecor = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10 2L18 18H2L10 2Z" fill="#7C4DFF" fillOpacity="0.4" />
  </svg>
);

export const DiamondDecor = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="8"
      y="0"
      width="11.3"
      height="11.3"
      rx="2"
      transform="rotate(45 8 0)"
      fill="#9575CD"
      fillOpacity="0.5"
    />
  </svg>
);
