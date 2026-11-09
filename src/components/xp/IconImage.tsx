import React from 'react';
import { XP_ICONS } from '../../assets/xpIcons';

interface IconImageProps {
  /** Key in XP_ICONS (see src/assets/xpIcons.ts). */
  name: string;
  size: number;
  /** Used only if the icon key is unknown. */
  fallback: React.ReactNode;
}

/** Shows a Windows XP icon from the embedded icon pack. */
export const IconImage: React.FC<IconImageProps> = ({ name, size, fallback }) => {
  const src = XP_ICONS[name];
  if (!src) return <>{fallback}</>;
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      draggable={false}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
    />
  );
};
