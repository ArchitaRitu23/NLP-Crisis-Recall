import { cn } from "@/lib/utils";
import type { SafetyRiskLevel } from "@/types";
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle } from "lucide-react";

interface RiskBadgeProps {
  level: SafetyRiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const levelConfig = {
  none: {
    label: 'No Risk',
    icon: CheckCircle,
    className: 'bg-risk-none/15 text-risk-none border-risk-none/30',
  },
  low: {
    label: 'Low Risk',
    icon: AlertCircle,
    className: 'bg-risk-low/15 text-risk-low border-risk-low/30',
  },
  medium: {
    label: 'Medium Risk',
    icon: AlertTriangle,
    className: 'bg-risk-medium/15 text-risk-medium border-risk-medium/30',
  },
  high: {
    label: 'High Risk',
    icon: AlertOctagon,
    className: 'bg-risk-high/15 text-risk-high border-risk-high/30',
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

export function RiskBadge({ level, showIcon = true, size = 'md', className }: RiskBadgeProps) {
  const config = levelConfig[level];
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
