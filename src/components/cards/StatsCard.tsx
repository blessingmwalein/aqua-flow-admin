'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  isLoading?: boolean;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  isLoading = false,
  iconColor = 'text-blue-500',
  iconBg = 'bg-blue-50 dark:bg-blue-900/20',
  onClick,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-3 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        </div>
      </Card>
    );
  }

  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
        ? TrendingDown
        : Minus;

  const trendColor =
    trend?.direction === 'up'
      ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
      : trend?.direction === 'down'
        ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
        : 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card
        className={cn(
          'p-6 transition-shadow duration-200',
          onClick && 'cursor-pointer hover:shadow-md',
        )}
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="flex items-start justify-between gap-4">
            {/* Left side */}
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {value}
              </p>
              {trend && (
                <div
                  className={cn(
                    'mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    trendColor,
                  )}
                >
                  <TrendIcon className="h-3 w-3 flex-shrink-0" />
                  <span>
                    {trend.value > 0 ? '+' : ''}
                    {trend.value}%
                  </span>
                  <span className="opacity-70">{trend.label}</span>
                </div>
              )}
            </div>
            {/* Icon */}
            <div
              className={cn(
                'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
                iconBg,
              )}
            >
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
