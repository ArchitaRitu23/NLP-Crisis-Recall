import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  value: number; // 0-1
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'h-16 w-16',
    radius: 28,
    strokeWidth: 4,
    text: 'text-xs',
    label: 'text-[10px]',
  },
  md: {
    container: 'h-24 w-24',
    radius: 42,
    strokeWidth: 5,
    text: 'text-sm',
    label: 'text-xs',
  },
  lg: {
    container: 'h-32 w-32',
    radius: 56,
    strokeWidth: 6,
    text: 'text-lg',
    label: 'text-sm',
  },
};

function getConfidenceColor(value: number): string {
  if (value >= 0.8) return 'stroke-risk-none';
  if (value >= 0.6) return 'stroke-risk-low';
  if (value >= 0.4) return 'stroke-risk-medium';
  return 'stroke-risk-high';
}

export function ConfidenceGauge({ 
  value, 
  label, 
  size = 'md',
  showPercentage = true,
  className 
}: ConfidenceGaugeProps) {
  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (value * circumference);
  const percentage = Math.round(value * 100);

  return (
    <div className={cn("relative flex items-center justify-center", config.container, className)}>
      <svg className="absolute transform -rotate-90" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={config.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={config.radius}
          fill="none"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-700 ease-out", getConfidenceColor(value))}
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        {showPercentage && (
          <span className={cn("font-bold text-foreground", config.text)}>
            {percentage}%
          </span>
        )}
        {label && (
          <span className={cn("text-muted-foreground mt-0.5", config.label)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
