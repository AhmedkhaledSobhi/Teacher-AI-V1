import type { SVGAttributes } from "react";

interface HeartProps extends SVGAttributes<SVGElement> {
  isDark?: boolean;
}

const Heart = ({ isDark = false, ...props }: HeartProps) => {
  if (isDark) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width="100"
        height="100"
        fill="none"
        {...props}
      >
        <g opacity="0.15">
          <path
            d="M6.92813 42.5561L32.599 69.6104C37.5281 74.8051 45.8052 74.8051 50.7343 69.6104L76.4052 42.5561C85.6427 32.8208 85.6427 17.0368 76.4052 7.30147C67.1677 -2.43383 52.1908 -2.43382 42.9533 7.30148C42.2539 8.03856 41.0795 8.03856 40.3801 7.30148C31.1426 -2.43382 16.1656 -2.43382 6.92812 7.30147C-2.30938 17.0368 -2.30937 32.8208 6.92813 42.5561Z"
            fill="#D4BDFF"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      fill="none"
      {...props}
    >
      <g opacity="0.15">
        <path
          d="M15.1017 53.065L40.7726 80.1193C45.7017 85.314 53.9788 85.314 58.9079 80.1193L84.5788 53.065C93.8163 43.3297 93.8163 27.5457 84.5788 17.8104C75.3413 8.0751 60.3644 8.0751 51.1269 17.8104C50.4275 18.5475 49.253 18.5475 48.5536 17.8104C39.3161 8.0751 24.3392 8.0751 15.1017 17.8104C5.86421 27.5457 5.86421 43.3297 15.1017 53.065Z"
          fill="#3E256B"
          stroke="#2B3F6C"
          strokeWidth="6.25"
        />
      </g>
    </svg>
  );
};

export default Heart;
