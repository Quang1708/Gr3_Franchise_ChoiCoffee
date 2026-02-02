
interface ChoiCoffeLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const ChoiCoffeLogo = ({ width = 200, height = 200, className = "" }: ChoiCoffeLogoProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="500" height="500" fill="#E89936" rx="20" />
      
      {/* Steam Lines */}
      <path
        d="M225 140 C225 140, 220 170, 225 185 C230 200, 225 210, 225 210"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M250 135 C250 135, 245 165, 250 180 C255 195, 250 210, 250 210"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M275 140 C275 140, 270 170, 275 185 C280 200, 275 210, 275 210"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cup */}
      <ellipse cx="250" cy="240" rx="90" ry="15" stroke="white" strokeWidth="5" fill="none" />
      <path
        d="M160 240 Q160 290 190 310 Q220 325 250 325 Q280 325 310 310 Q340 290 340 240"
        stroke="white"
        strokeWidth="5"
        fill="none"
      />

      {/* Handle */}
      <path
        d="M340 250 Q380 250 380 285 Q380 310 350 310"
        stroke="white"
        strokeWidth="5"
        fill="none"
      />

      {/* Saucer - Outer Ellipse */}
      <ellipse cx="250" cy="330" rx="105" ry="20" stroke="white" strokeWidth="5" fill="none" />
      {/* Saucer - Inner Ellipse */}
      <ellipse cx="250" cy="330" rx="75" ry="13" stroke="white" strokeWidth="4" fill="none" />

      {/* Text: CHOICOFFEE */}
      <g transform="translate(165, 340)">
        {/* Circle decorations */}
        <circle cx="0" cy="15" r="8" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="20" cy="15" r="8" stroke="white" strokeWidth="2" fill="none" />
        
        {/* Letters */}
        <text
          x="40"
          y="20"
          fill="white"
          fontSize="24"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          letterSpacing="2"
        >
          CHOICOFFEE
        </text>
        
        {/* Circle decorations on right */}
        <circle cx="170" cy="15" r="8" stroke="white" strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
};

export default ChoiCoffeLogo;