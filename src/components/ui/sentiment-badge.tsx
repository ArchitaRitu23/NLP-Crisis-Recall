import { cn } from "@/lib/utils";
import type { SentimentType } from "@/types";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface SentimentBadgeProps {
  sentiment: SentimentType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sentimentConfig = {
  positive: {
    label: 'Positive',
    icon: ThumbsUp,
    className: 'bg-sentiment-positive/15 text-sentiment-positive border-sentiment-positive/30',
  },
  neutral: {
    label: 'Neutral',
    icon: Minus,
    className: 'bg-sentiment-neutral/15 text-sentiment-neutral border-sentiment-neutral/30',
  },
  negative: {
    label: 'Negative',
    icon: ThumbsDown,
    className: 'bg-sentiment-negative/15 text-sentiment-negative border-sentiment-negative/30',
  },
};

const sizeConfig = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'px-3 py-1 text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    badge: 'px-4 py-1.5 text-base',
    icon: 'h-5 w-5',
  },
};

export function SentimentBadge({ sentiment, showIcon = true, size = 'md', className }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
        config.className,
        sizeStyles.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeStyles.icon} />}
      {config.label}
    </span>
  );
}
