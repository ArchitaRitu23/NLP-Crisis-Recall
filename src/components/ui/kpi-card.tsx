import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'risk-high' | 'risk-medium' | 'risk-low' | 'risk-none';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-primary text-primary-foreground border-primary',
  'risk-high': 'bg-risk-high/10 border-risk-high/30 text-foreground',
  'risk-medium': 'bg-risk-medium/10 border-risk-medium/30 text-foreground',
  'risk-low': 'bg-risk-low/10 border-risk-low/30 text-foreground',
  'risk-none': 'bg-risk-none/10 border-risk-none/30 text-foreground',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  'risk-high': 'bg-risk-high/20 text-risk-high',
  'risk-medium': 'bg-risk-medium/20 text-risk-medium',
  'risk-low': 'bg-risk-low/20 text-risk-low',
  'risk-none': 'bg-risk-none/20 text-risk-none',
};

export function KpiCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className 
}: KpiCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 shadow-card transition-all duration-300 hover:shadow-elevated animate-scale-in",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn(
            "text-sm font-medium",
            variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            variant === 'primary' ? 'text-primary-foreground' : 'text-foreground'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-xs",
              variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            iconStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className={cn(
            "text-sm font-medium",
            trend.value >= 0 ? 'text-risk-none' : 'text-risk-high'
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className={cn(
            "text-xs",
            variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}
