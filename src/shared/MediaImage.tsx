import { useState } from 'react';
import { Mountain } from 'lucide-react';
import { getImageSrc } from '../lib/images';
import type { ImageKey } from '../types';

interface MediaImageProps {
  imageKey: ImageKey;
  alt: string;
  className?: string;
}

export function MediaImage({ imageKey, alt, className = '' }: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E4ECE8] via-[#D6E3DC] to-[#C8D9D0] text-[#14533C] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Mountain className="w-8 h-8 mb-2 opacity-75" strokeWidth={1.5} />
        <span className="text-xs font-medium text-[#2A4239] max-w-[22ch]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={getImageSrc(imageKey)}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
