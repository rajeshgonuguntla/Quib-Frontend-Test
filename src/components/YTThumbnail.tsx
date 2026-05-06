interface YTThumbnailProps {
  videoId: string;
  alt: string;
  className?: string;
}

const QUALITIES = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'] as const;

export function YTThumbnail({ videoId, alt, className }: YTThumbnailProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const current = QUALITIES.find(q => img.src.includes(q));
    const nextIndex = current ? QUALITIES.indexOf(current) + 1 : QUALITIES.length;
    if (nextIndex < QUALITIES.length) {
      img.src = `https://img.youtube.com/vi/${videoId}/${QUALITIES[nextIndex]}.jpg`;
    }
  };

  return (
    <img
      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
