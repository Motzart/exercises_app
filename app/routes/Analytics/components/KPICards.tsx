import React from 'react'
import { ClockIcon, FireIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/16/solid'
import { useTotalDuration, useExercisesCount } from '~/hooks/useTotalDuration'
import { usePracticeStreak, useAverageSessionDurationFormatted, usePracticeDaysCount } from '~/hooks/useAnalytics'
import { Card, CardContent } from '~/components/ui/card'

interface KPICardsProps {
  startDate?: Date
  endDate?: Date
}

function KPICard({
  icon: Icon,
  title,
  value,
  isLoading,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string | number
  isLoading: boolean
  subtitle?: string
}) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-700/50 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-white">{value}</p>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="ml-4">
            <Icon className="size-8 text-gray-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KPICards({ startDate, endDate }: KPICardsProps) {
  const { data: totalDuration, isLoading: isLoadingTotal } = useTotalDuration()
  const { data: exercisesCount, isLoading: isLoadingCount } = useExercisesCount()
  const { data: streak, isLoading: isLoadingStreak } = usePracticeStreak()
  const { data: avgDuration, isLoading: isLoadingAvg } = useAverageSessionDurationFormatted(startDate, endDate)
  
  // Use current month as default period if not specified
  const defaultStartDate = React.useMemo(() => {
    if (startDate) return startDate
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    start.setHours(0, 0, 0, 0)
    return start
  }, [startDate])

  const defaultEndDate = React.useMemo(() => {
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      return end
    }
    const now = new Date()
    now.setHours(23, 59, 59, 999)
    return now
  }, [endDate])

  const { data: practiceDays, isLoading: isLoadingDays, error: practiceDaysError } = usePracticeDaysCount(
    defaultStartDate,
    defaultEndDate,
  )

  // Calculate total days in period
  const totalDaysInPeriod = React.useMemo(() => {
    return Math.ceil((defaultEndDate.getTime() - defaultStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }, [defaultStartDate, defaultEndDate])

  const practiceDaysSubtitle = React.useMemo(() => {
    if (practiceDays === undefined || totalDaysInPeriod <= 0) return undefined
    return `${practiceDays} з ${totalDaysInPeriod} днів`
  }, [practiceDays, totalDaysInPeriod])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        icon={ClockIcon}
        title="Загальний час"
        value={totalDuration || '00h:00m'}
        isLoading={isLoadingTotal}
      />
      <KPICard
        icon={FireIcon}
        title="Поточна серія"
        value={streak !== undefined ? `${streak} днів` : '0 днів'}
        isLoading={isLoadingStreak}
        subtitle={streak && streak > 0 ? '🔥 Тримай темп!' : undefined}
      />
      <KPICard
        icon={ChartBarIcon}
        title="Середня тривалість"
        value={avgDuration || '00h:00m'}
        isLoading={isLoadingAvg}
      />
      <KPICard
        icon={CalendarIcon}
        title="Днів з практикою"
        value={
          practiceDaysError 
            ? 'Помилка' 
            : practiceDays !== undefined 
              ? practiceDays 
              : (isLoadingDays ? '...' : 0)
        }
        isLoading={isLoadingDays && !practiceDaysError}
        subtitle={practiceDaysSubtitle}
      />
    </div>
  )
}

