interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ progress, showLabel = false, className = '' }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">{clampedProgress}%</span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}