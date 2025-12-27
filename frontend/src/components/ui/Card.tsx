import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'card',
        hover && 'card-hover',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// Stat Card component
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: 'blue' | 'teal' | 'purple' | 'orange' | 'green' | 'red';
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color = 'blue',
  trend,
  className,
}) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 text-blue-400',
    teal: 'from-teal-500/20 to-teal-600/20 text-teal-400',
    purple: 'from-purple-500/20 to-purple-600/20 text-purple-400',
    orange: 'from-orange-500/20 to-orange-600/20 text-orange-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    red: 'from-red-500/20 to-red-600/20 text-red-400',
  };

  return (
    <div className={clsx('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className={clsx('stat-icon bg-gradient-to-br', colorClasses[color])}>
          {icon}
        </div>
        {trend && (
          <span
            className={clsx(
              'text-sm font-medium',
              trend.isUp ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
};

export default Card;



