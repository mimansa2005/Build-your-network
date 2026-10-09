import React from 'react';

export interface SpeedoLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtext?: boolean;
  withCard?: boolean;
  subtext?: string;
  inverted?: boolean; // If true, text is white (for dark/banner overlay)
}

export const SpeedoLogo: React.FC<SpeedoLogoProps> = ({
  className = '',
  size = 'md',
  showSubtext = false,
  withCard = true,
  subtext = 'BUILD YOUR NETWORK',
  inverted = false,
}) => {
  // Dimensions for each size preset
  const sizeStyles = {
    xs: {
      container: 'w-20',
    },
    sm: {
      container: 'w-28 sm:w-32',
    },
    md: {
      container: 'w-40 sm:w-48',
    },
    lg: {
      container: 'w-56 sm:w-64',
    },
    xl: {
      container: 'w-72 sm:w-80',
    },
  };

  const currentSize = sizeStyles[size];
  const textColor = inverted ? '#FFFFFF' : '#FF6000';
  const bgColor = inverted ? 'transparent' : '#FFFFFF';

  return (
    <div
      id="speedo-express-brand-logo"
      className={`inline-flex flex-col items-center select-none ${className}`}
    >
      {/* Container with White Background as explicitly requested */}
      <div
        className={`flex flex-col items-center justify-center transition-all ${
          inverted
            ? ''
            : withCard
            ? 'bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm'
            : 'bg-white p-1 rounded-xl'
        } ${currentSize.container}`}
      >
        <svg
          viewBox="0 0 460 230"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Speedo Express Official Logo"
        >
          {/* Pure White Background Rect */}
          {!inverted && (
            <rect width="460" height="230" fill={bgColor} rx="16" />
          )}

          {/* 
            Uniform typography matching PL O T.png:
            All letters in SPEƎDO have the EXACT same font size (84px),
            cap height, baseline (y=94), and stroke thickness.
            The reversed Ǝ is derived from the exact same E glyph mirrored horizontally.
          */}
          <g transform="skewX(-12) translate(28, 10)">
            {/* SP */}
            <text
              x="18"
              y="94"
              fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="84"
              letterSpacing="-1"
              fill={textColor}
            >
              SP
            </text>

            {/* Left E (exact same font & size) */}
            <text
              x="136"
              y="94"
              fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="84"
              letterSpacing="-1"
              fill={textColor}
            >
              E
            </text>

            {/* Right Reversed Ǝ (exact same font & size, mirrored horizontally) */}
            <g transform="translate(242, 0) scale(-1, 1)">
              <text
                x="0"
                y="94"
                fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
                fontWeight="900"
                fontSize="84"
                letterSpacing="-1"
                fill={textColor}
              >
                E
              </text>
            </g>

            {/* DO (exact same font & size) */}
            <text
              x="248"
              y="94"
              fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="84"
              letterSpacing="-1"
              fill={textColor}
            >
              DO
            </text>

            {/* Line 2: EXPRESS */}
            <text
              x="20"
              y="176"
              fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="80"
              letterSpacing="0.5"
              fill={textColor}
            >
              EXPRESS
            </text>
          </g>
        </svg>
      </div>

      {showSubtext && (
        <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-slate-600 uppercase mt-2 font-heading">
          {subtext}
        </span>
      )}
    </div>
  );
};
