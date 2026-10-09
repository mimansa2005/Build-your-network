import React from 'react';

export type LogisticsIconType = 'truck' | 'package' | 'courier';

interface LogisticsIconProps {
  type: LogisticsIconType;
  className?: string;
  size?: number; // Size in pixels
  inverted?: boolean;
}

/**
 * Modern vector logistics icons matching the Speedo Express visual identity:
 * - 'truck': Delivery Truck (Round 1 - Easy)
 * - 'package': Parcel / Package Box (Round 2 - Medium)
 * - 'courier': Delivery Partner (Round 3 - Tough)
 */
export const LogisticsIcon: React.FC<LogisticsIconProps> = ({
  type,
  className = '',
  size = 32,
  inverted = false,
}) => {
  const primaryOrange = '#FF6B00';
  const darkNavy = '#0F172A';
  const white = '#FFFFFF';

  if (type === 'truck') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Truck Cargo Box */}
        <rect
          x="4"
          y="12"
          width="25"
          height="20"
          rx="3"
          fill={inverted ? white : primaryOrange}
        />
        {/* Speed lines on cargo body */}
        <path
          d="M7 17H16M7 21H19M7 25H14"
          stroke={inverted ? primaryOrange : white}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Cabin */}
        <path
          d="M29 17H37.5C38.6 17 39.6 17.6 40.2 18.5L43.4 23.5C43.8 24.1 44 24.8 44 25.5V32H29V17Z"
          fill={inverted ? '#E2E8F0' : '#1E293B'}
        />
        {/* Cabin Windshield */}
        <path
          d="M31 19.5H36.8L40.2 24.5H31V19.5Z"
          fill="#94A3B8"
        />
        {/* Headlight */}
        <rect
          x="42"
          y="28"
          width="2"
          height="3"
          rx="1"
          fill="#FDE047"
        />
        {/* Front Bumper */}
        <rect
          x="42"
          y="31"
          width="3"
          height="2"
          rx="1"
          fill="#64748B"
        />
        {/* Chassis Rail */}
        <rect
          x="5"
          y="31.5"
          width="38"
          height="2"
          fill="#0F172A"
          opacity="0.3"
        />
        {/* Rear Wheel */}
        <circle cx="13" cy="33" r="5" fill={darkNavy} />
        <circle cx="13" cy="33" r="2.2" fill={inverted ? white : primaryOrange} />
        {/* Front Wheel */}
        <circle cx="36" cy="33" r="5" fill={darkNavy} />
        <circle cx="36" cy="33" r="2.2" fill={inverted ? white : primaryOrange} />
      </svg>
    );
  }

  if (type === 'package') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Isometric Package Box Main Faces */}
        {/* Left Face */}
        <path
          d="M6 16.5L24 26.5V43L6 32V16.5Z"
          fill={inverted ? '#E2E8F0' : '#EA580C'}
        />
        {/* Right Face */}
        <path
          d="M24 26.5L42 16.5V32L24 43V26.5Z"
          fill={inverted ? '#CBD5E1' : '#C2410C'}
        />
        {/* Top Face */}
        <path
          d="M24 6L42 16.5L24 26.5L6 16.5L24 6Z"
          fill={inverted ? white : primaryOrange}
        />

        {/* Speedo Express Orange Tape across Top */}
        <path
          d="M19 8.8L37 19.3L33.5 21.3L15.5 10.8L19 8.8Z"
          fill={inverted ? primaryOrange : white}
          opacity={inverted ? '1' : '0.92'}
        />
        {/* Tape running down front center */}
        <path
          d="M22 25.5H26V43H22V25.5Z"
          fill={inverted ? primaryOrange : white}
          opacity={inverted ? '1' : '0.92'}
        />

        {/* Shipping Dispatch Label on Left Face */}
        <path
          d="M10 24.5L18 29V34L10 29.5V24.5Z"
          fill={inverted ? '#0F172A' : white}
          opacity="0.95"
        />
        {/* Label lines */}
        <path
          d="M12 26.5L16 28.7M12 28.5L16 30.7"
          stroke={inverted ? white : primaryOrange}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Up Arrows / Handle with care symbol */}
        <path
          d="M32 25L34 23.8L36 25M34 23.8V29"
          stroke={inverted ? darkNavy : white}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 'courier': Delivery Partner (Round 3 - Tough)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Delivery Partner Cap / Visor */}
      <path
        d="M16 11.5C16 8.5 19.5 7 24 7C28.5 7 32 8.5 32 11.5V13H16V11.5Z"
        fill={inverted ? white : primaryOrange}
      />
      <path
        d="M22 13H36C36.8 13 37.5 13.6 37.5 14.5C37.5 15.3 36.8 16 36 16H24"
        stroke={inverted ? white : primaryOrange}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Head / Face */}
      <circle cx="24" cy="15.5" r="5.5" fill="#FED7AA" />
      {/* Neat Hair */}
      <path
        d="M18.8 13.5C19.5 11.8 21.5 11 24 11C26.5 11 28.5 11.8 29.2 13.5"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Speedo Delivery Uniform Polo (Orange Body with Dark Slate Collar) */}
      <path
        d="M15 23C15 20.8 16.8 19 19 19H29C31.2 19 33 20.8 33 23V31H15V23Z"
        fill={inverted ? white : primaryOrange}
      />
      {/* Dark Collar / V-Neck Trim */}
      <path
        d="M21 19L24 23L27 19"
        stroke={darkNavy}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Speedo Partner Badge / ID on chest */}
      <rect
        x="18"
        y="22"
        width="3.5"
        height="4"
        rx="0.8"
        fill={darkNavy}
      />

      {/* Delivery Parcel being carried securely in arms */}
      <rect
        x="17"
        y="27"
        width="14"
        height="11"
        rx="2"
        fill={inverted ? '#E2E8F0' : '#EA580C'}
        stroke={darkNavy}
        strokeWidth="1.5"
      />
      {/* Parcel Seal Tape */}
      <line
        x1="24"
        y1="27"
        x2="24"
        y2="38"
        stroke={inverted ? primaryOrange : white}
        strokeWidth="2"
      />

      {/* Hands holding the box */}
      <circle cx="16.5" cy="32" r="2.2" fill="#FED7AA" />
      <circle cx="31.5" cy="32" r="2.2" fill="#FED7AA" />

      {/* Lower Belt */}
      <path
        d="M16 38.5H32"
        stroke={darkNavy}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
