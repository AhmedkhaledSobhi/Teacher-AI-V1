import type { SVGAttributes } from "react";

interface BookProps extends SVGAttributes<SVGElement> {
  isDark?: boolean;
}

const Book = ({ isDark = false, ...props }: BookProps) => {
  const bookPath = (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.8196 12.5101C22.9585 8.33013 35.375 8.33007 46.5139 12.5101L46.8752 12.6449V89.684L40.9651 87.4662C33.3942 84.6251 24.9393 84.6252 17.3684 87.4662C11.8016 89.5552 5.20832 85.8105 5.20825 79.4984V21.7875C5.20832 17.5917 7.92422 13.9719 11.8196 12.5101ZM53.4856 12.5101C64.6246 8.33003 77.0419 8.33003 88.1809 12.5101C92.076 13.972 94.7912 17.5919 94.7913 21.7875V79.4984C94.7912 85.8103 88.1988 89.5548 82.6321 87.4662C75.0612 84.6251 66.6053 84.6251 59.0344 87.4662L53.1252 89.683V12.6449L53.4856 12.5101Z"
      fill="#DC64C9"
    />
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      {...props}
    >
      <g opacity="0.15">{bookPath}</g>
    </svg>
  );
};

export default Book;
