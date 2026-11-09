import React, { useId } from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/** Unique, CSS-safe ids for SVG gradients (React useId may contain colons). */
const useSvgId = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

export const WindowsFlagIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M2 5.2C5.2 3.8 8.3 4 11.2 5.4L9.7 11.4C6.9 10 4 9.9 1 11.2L2 5.2Z" fill="#F25022" />
    <path d="M12.6 5.9C15.6 7.3 18.8 7.3 22 5.8L20.9 11.8C17.8 13.3 14.7 13.2 11.1 11.8L12.6 5.9Z" fill="#7FBA00" />
    <path d="M1 12.6C4 11.3 6.9 11.4 9.5 12.8L8.1 18.8C5.4 17.4 2.7 17.4 0 18.6L1 12.6Z" fill="#00A4EF" />
    <path d="M10.9 13.2C14.4 14.7 17.5 14.7 20.6 13.2L19.5 19.2C16.3 20.7 13.1 20.6 9.5 19.1L10.9 13.2Z" fill="#FFB900" />
  </svg>
);

export const MyComputerIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => {
  const g = useSvgId('screen');
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
      <defs>
        <linearGradient id={g} x1="9" y1="10" x2="35" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#56B4FF" />
          <stop offset="0.65" stopColor="#1D66D4" />
          <stop offset="1" stopColor="#77D266" />
        </linearGradient>
      </defs>
      <rect x="6" y="7" width="32" height="24" rx="2.5" fill="#DCE6F5" stroke="#31548F" strokeWidth="2" />
      <rect x="9" y="10" width="26" height="17" rx="1" fill={`url(#${g})`} stroke="#4E73B5" strokeWidth="1" />
      <path d="M16 31H28L31 36H13L16 31Z" fill="#B5C4DC" stroke="#4D668E" strokeWidth="1.5" />
      <rect x="10" y="36" width="24" height="3.5" rx="1" fill="#CED8EA" stroke="#4D668E" strokeWidth="1.3" />
      <rect x="29" y="18" width="13" height="22" rx="1.5" fill="#E9ECF2" stroke="#4B5D7A" strokeWidth="1.6" />
      <rect x="31.5" y="21" width="8" height="2" fill="#7E97C1" />
      <rect x="31.5" y="24.5" width="8" height="2" fill="#7E97C1" />
      <circle cx="35.5" cy="34.5" r="1.6" fill="#46B849" />
    </svg>
  );
};

export const FolderIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => {
  const g = useSvgId('folder');
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
      <defs>
        <linearGradient id={g} x1="24" y1="14.5" x2="24" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE98A" />
          <stop offset="0.5" stopColor="#FAD058" />
          <stop offset="1" stopColor="#E6A92E" />
        </linearGradient>
      </defs>
      <path
        d="M5 12C5 10.3 6.3 9 8 9H18L21.5 13H40C41.7 13 43 14.3 43 16V36C43 37.7 41.7 39 40 39H8C6.3 39 5 37.7 5 36V12Z"
        fill="#E5A93B"
        stroke="#9E6C18"
        strokeWidth="1.6"
      />
      <path
        d="M6 17C6 15.6 7.1 14.5 8.5 14.5H41.5C42.9 14.5 44 15.6 44 17L42 36.5C41.9 37.9 40.7 39 39.3 39H7.5C6.1 39 5 37.9 5 36.5L6 17Z"
        fill={`url(#${g})`}
        stroke="#AE7719"
        strokeWidth="1.5"
      />
      <path d="M8 16.5H41" stroke="#FFF4C2" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};

export const GuitarAppIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => {
  const g = useSvgId('guitar');
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
      <defs>
        <linearGradient id={g} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFBA52" />
          <stop offset="1" stopColor="#B84B1C" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="7" fill={`url(#${g})`} stroke="#7B341E" strokeWidth="1.6" />
      <path
        d="M27.5 18.5C24.8 18.5 22.8 20.3 22 22.4C21.2 24.4 19.6 25.3 17.5 25.9C13.8 27 11.5 30.2 12 34C12.5 38.2 16.2 40.5 20.5 39.7C24.5 39 27 36.2 27.6 32.8C28.1 30.2 29.2 28.7 31.1 27.5C33.1 26.2 34.4 24.2 33.8 21.8C33.2 19.6 30.5 18.5 27.5 18.5Z"
        fill="#D97724"
        stroke="#5C260B"
        strokeWidth="1.5"
      />
      <circle cx="22.8" cy="30.6" r="3.4" fill="#3E1907" stroke="#F6C886" strokeWidth="1" />
      <path d="M27.5 23.2L37.5 10.5L39.6 12.2L29.6 24.9" fill="#6D3418" stroke="#3E1907" strokeWidth="1.2" />
      <rect x="36.2" y="7.5" width="5.2" height="5.2" rx="1" transform="rotate(38 36.2 7.5)" fill="#8B4513" stroke="#3E1907" strokeWidth="1" />
      <path d="M12 10V17.5C12 18.9 10.9 20 9.5 20C8.1 20 7 18.9 7 17.5C7 16.1 8.1 15 9.5 15C10 15 10.4 15.1 10.8 15.3V10H16V12.5H12Z" fill="#FFF7D6" />
    </svg>
  );
};

export const NotepadIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
    <rect x="10" y="6" width="28" height="36" rx="2" fill="#FFFFFF" stroke="#4D6891" strokeWidth="1.8" />
    <rect x="10" y="6" width="28" height="7" rx="1.5" fill="#4685D6" stroke="#315E9C" strokeWidth="1.4" />
    <circle cx="15" cy="9.5" r="1.2" fill="#DCE9FA" />
    <circle cx="20.5" cy="9.5" r="1.2" fill="#DCE9FA" />
    <circle cx="26" cy="9.5" r="1.2" fill="#DCE9FA" />
    <circle cx="31.5" cy="9.5" r="1.2" fill="#DCE9FA" />
    <line x1="15" y1="19" x2="33" y2="19" stroke="#92A8C9" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="15" y1="24.5" x2="33" y2="24.5" stroke="#92A8C9" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="15" y1="30" x2="29" y2="30" stroke="#92A8C9" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="15" y1="35.5" x2="25" y2="35.5" stroke="#92A8C9" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
    <rect x="6" y="9" width="36" height="30" rx="2.5" fill="#18181B" stroke="#4F6B94" strokeWidth="2" />
    <rect x="6" y="9" width="36" height="7" rx="2" fill="#2563EB" />
    <path d="M12 23L17.5 27L12 31" stroke="#4ADE80" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="21" y1="31" x2="30" y2="31" stroke="#E4E4E7" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const RecycleBinIcon: React.FC<IconProps & { full?: boolean }> = ({ size = 36, full = false, className = '' }) => {
  const g = useSvgId('bin');
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
      <defs>
        <linearGradient id={g} x1="11" y1="0" x2="37" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#94AED6" />
          <stop offset="0.42" stopColor="#EEF4FD" />
          <stop offset="1" stopColor="#86A0C8" />
        </linearGradient>
      </defs>
      {full && (
        <>
          <path d="M14 14 L20 3.5 L27 9 L22 15 Z" fill="#FFFFFF" stroke="#8C8C8C" strokeWidth="1" />
          <path d="M23 14 L31 4.5 L36.5 11 L33 15 Z" fill="#FFF3C4" stroke="#A3A3A3" strokeWidth="1" />
          <path d="M18 14 L24 7 L30 12 L28 15 Z" fill="#DBEAFE" stroke="#8C8C8C" strokeWidth="1" />
          <path d="M21 9 L25 8.5 M22.5 11.5 L27 10.5" stroke="#9CA3AF" strokeWidth="0.8" />
        </>
      )}
      <path
        d="M11 14 H37 L34.4 41.2 C34.2 42.6 33.1 43.6 31.7 43.6 H16.3 C14.9 43.6 13.8 42.6 13.6 41.2 Z"
        fill={`url(#${g})`}
        stroke="#4A6491"
        strokeWidth="1.6"
      />
      <ellipse cx="24" cy="14" rx="13" ry="3.2" fill="#E3ECF8" stroke="#4A6491" strokeWidth="1.4" />
      <path
        d="M24 22.5 L30.5 33 L17.5 33 Z"
        stroke="#2F8E47"
        strokeWidth="2.3"
        strokeLinejoin="round"
        strokeDasharray="8 3"
        fill="none"
      />
      <path d="M17 18 L18.5 39 M31 18 L29.5 39" stroke="#A9BEDD" strokeWidth="1" />
    </svg>
  );
};

export const SpeakerIcon: React.FC<IconProps & { muted?: boolean }> = ({ size = 18, muted = false, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
    <path d="M4 9H8.5L14 4.5V19.5L8.5 15H4V9Z" fill="#DCE6F7" stroke="#1E3F73" strokeWidth="1.5" strokeLinejoin="round" />
    {muted ? (
      <path d="M17 9L21 15M21 9L17 15" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <>
        <path d="M16.5 8.8C17.8 10 17.8 14 16.5 15.2" stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M19 6.5C21.3 9 21.3 15 19 17.5" stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round" />
      </>
    )}
  </svg>
);

export const InternetIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => {
  const g = useSvgId('ie');
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
      <defs>
        <linearGradient id={g} x1="10" y1="8" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7CC7FF" />
          <stop offset="0.55" stopColor="#1E6FE0" />
          <stop offset="1" stopColor="#0B3EA8" />
        </linearGradient>
      </defs>
      <path d="M8 31 C2 22 14 9 31 8" stroke="#F6B800" strokeWidth="3" strokeLinecap="round" />
      <text
        x="24"
        y="38"
        textAnchor="middle"
        fontSize="38"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        fill={`url(#${g})`}
        stroke="#0B2F7A"
        strokeWidth="0.8"
      >
        e
      </text>
      <path d="M31 8 C44 7 46 18 39 27" stroke="#F6B800" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

/** Kept for existing apps that import the old name. */
export const GitHubGlobeIcon = InternetIcon;

export const RepoFileIcon: React.FC<IconProps & { color?: string }> = ({ size = 28, color = '#3572A5', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none">
    <path d="M6 4H20L26 10V28H6V4Z" fill="#FFFFFF" stroke="#6E84A3" strokeWidth="1.4" />
    <path d="M20 4V10H26" fill="#DCE6F5" stroke="#6E84A3" strokeWidth="1.2" />
    <rect x="8.5" y="14" width="15" height="4" rx="1" fill={color} />
    <line x1="9" y1="21.5" x2="22" y2="21.5" stroke="#94A3B8" strokeWidth="1.5" />
    <line x1="9" y1="24.5" x2="18" y2="24.5" stroke="#94A3B8" strokeWidth="1.5" />
  </svg>
);

export const PdfIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
    <path d="M11 4 H30 L39 13 V44 H11 Z" fill="#FFFFFF" stroke="#7D7D7D" strokeWidth="1.5" />
    <path d="M30 4 V13 H39" fill="#E9E9E9" stroke="#7D7D7D" strokeWidth="1.3" />
    <path
      d="M17 24 C21 15 28 15 26 21 C24 27 17 31 19 33 C21.5 35 28 27 33 30"
      stroke="#D6261C"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <rect x="6" y="32" width="27" height="10.5" rx="1.5" fill="#D6261C" stroke="#9E140C" strokeWidth="0.8" />
    <text x="19.5" y="40.3" textAnchor="middle" fontSize="8" fontWeight="700" fill="#FFFFFF" fontFamily="Tahoma, Arial, sans-serif">
      PDF
    </text>
  </svg>
);

export const AimIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => {
  const limbs =
    'M27.5 14.5 L21.5 27 M26 17.5 L33 21 L38.5 16.5 M25 16.5 L18 18.5 L13 14 M21.5 27 L29.5 32 L28 42 M21.5 27 L16 35 L8.5 36.5';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
      <path d={limbs} stroke="#1A1A1A" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29.5" cy="8.5" r="6.2" fill="#1A1A1A" />
      <path d={limbs} stroke="#FFD400" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29.5" cy="8.5" r="4.6" fill="#FFD400" />
      <circle cx="28" cy="7" r="1.4" fill="#FFF6B0" />
    </svg>
  );
};

export const MinesweeperIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
    <rect x="4" y="4" width="40" height="40" rx="3" fill="#C0C0C0" stroke="#6B6B6B" strokeWidth="1.5" />
    <path d="M6 42 V6 H42" stroke="#FFFFFF" strokeWidth="2.2" />
    <g stroke="#111" strokeWidth="3" strokeLinecap="round">
      <line x1="24" y1="9.5" x2="24" y2="38.5" />
      <line x1="9.5" y1="24" x2="38.5" y2="24" />
      <line x1="14" y1="14" x2="34" y2="34" />
      <line x1="34" y1="14" x2="14" y2="34" />
    </g>
    <circle cx="24" cy="24" r="10" fill="#111" />
    <rect x="19" y="19" width="4.5" height="4.5" fill="#FFFFFF" />
  </svg>
);

export const SolitaireIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
    <g transform="rotate(-14 19 26)">
      <rect x="8" y="10" width="22" height="30" rx="3" fill="#1D4FBF" stroke="#0B2F7A" strokeWidth="1.4" />
      <rect x="11" y="13" width="16" height="24" rx="1.5" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2 2" />
    </g>
    <g transform="rotate(10 30 24)">
      <rect x="18" y="8" width="22" height="30" rx="3" fill="#FFFFFF" stroke="#4B4B4B" strokeWidth="1.4" />
      <text x="21.5" y="17" fontSize="8" fontWeight="700" fill="#D40000" fontFamily="Arial, sans-serif">
        A
      </text>
      <path d="M29 31 C24 27 22 25 22 22.5 A3.2 3.2 0 0 1 29 21 A3.2 3.2 0 0 1 36 22.5 C36 25 34 27 29 31 Z" fill="#D40000" />
    </g>
  </svg>
);

export const PaintIcon: React.FC<IconProps> = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} fill="none">
    <path
      d="M24 8 C12 8 4.5 15.5 4.5 23.5 C4.5 31.5 11 36.5 17.5 35.6 C20.6 35.2 20.8 32.2 19.2 30.6 C17.7 29.1 18.4 26.6 20.8 26.6 H28 C36 26.6 43 23.6 43 16.6 C43 11.6 35 8 24 8 Z"
      fill="#F3E2B3"
      stroke="#8A6D2B"
      strokeWidth="1.5"
    />
    <circle cx="13.5" cy="21" r="3.2" fill="#E11D48" />
    <circle cx="20.5" cy="14.5" r="3.2" fill="#2563EB" />
    <circle cx="29.5" cy="14" r="3.2" fill="#16A34A" />
    <circle cx="36.5" cy="19" r="3.2" fill="#FACC15" />
    <path d="M25 45 L38.5 29" stroke="#7C4A1E" strokeWidth="3.6" strokeLinecap="round" />
    <path d="M38.5 29 L41.8 25" stroke="#9CA3AF" strokeWidth="4.2" strokeLinecap="round" />
    <path d="M41.8 25 L44.6 21.4" stroke="#1D4ED8" strokeWidth="3.6" strokeLinecap="round" />
  </svg>
);

export const HelpIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none">
    <circle cx="16" cy="16" r="13" fill="#2B6FDB" stroke="#0E3E91" strokeWidth="1.5" />
    <circle cx="12" cy="11" r="4" fill="#FFFFFF" opacity="0.25" />
    <text x="16" y="22" textAnchor="middle" fontSize="17" fontWeight="700" fill="#FFFFFF" fontFamily="Tahoma, Arial, sans-serif">
      ?
    </text>
  </svg>
);

type PowerVariant = 'standby' | 'off' | 'restart' | 'logoff' | 'switch';
const POWER_COLORS: Record<PowerVariant, [string, string]> = {
  standby: ['#FBD86F', '#D59311'],
  off: ['#F49377', '#C3381A'],
  restart: ['#94D97F', '#36932E'],
  logoff: ['#FBD86F', '#D59311'],
  switch: ['#9DBDF3', '#2B5FC4'],
};

export const PowerIcon: React.FC<IconProps & { variant: PowerVariant }> = ({ size = 32, variant, className = '' }) => {
  const g = useSvgId('pwr');
  const [top, bottom] = POWER_COLORS[variant];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none">
      <defs>
        <linearGradient id={g} x1="0" y1="1" x2="0" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="5" fill={`url(#${g})`} stroke="#FFFFFF" strokeWidth="1.5" />
      {(variant === 'standby' || variant === 'off') && (
        <>
          <path d="M16 7.5 V16" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <path d="M10.6 10.8 A8 8 0 1 0 21.4 10.8" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {variant === 'restart' && (
        <>
          <path d="M22.5 11.5 A8 8 0 1 0 24 18.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <path d="M18.5 12.6 L25.4 12.6 L25.4 5.8 Z" fill="#FFFFFF" />
        </>
      )}
      {variant === 'logoff' && (
        <>
          <path d="M13 8.5 H8.5 V23.5 H13" stroke="#FFFFFF" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M14 16 H24.5 M20.5 11.5 L25 16 L20.5 20.5" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {variant === 'switch' && (
        <>
          <circle cx="12" cy="11.5" r="3.6" fill="#FFFFFF" />
          <path d="M5.5 24 C5.5 19.5 8.5 17 12 17 C15.5 17 18.5 19.5 18.5 24 Z" fill="#FFFFFF" />
          <circle cx="21.5" cy="10.5" r="3" fill="#FFFFFF" opacity="0.8" />
          <path d="M17.5 21.5 C18.2 17.8 20 16 22 16 C24.8 16 26.8 18.5 26.8 22.5 L19.5 22.5" fill="#FFFFFF" opacity="0.8" />
        </>
      )}
    </svg>
  );
};

export const GreenArrowIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" className={className} fill="none">
    <circle cx="10" cy="10" r="8.5" fill="#3FAA3A" stroke="#1F6E1B" strokeWidth="1.2" />
    <path d="M8 5.5 L13 10 L8 14.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
