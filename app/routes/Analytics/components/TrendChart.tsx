import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useSessionsByDateRange } from '~/hooks/useTotalDuration'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '~/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { useIsMobile } from '~/hooks/use-mobile'

const chartConfig = {
  duration: {
    label: 'хвилин',
    color: 'hsl(var(--chart-1))',
  },
  previousDuration: {
    label: 'хвилин (попередній період)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

type TimeRange = '7d' | '30d' | '90d'

function getDateRange(timeRange: TimeRange): {
  startDate: Date
  endDate: Date
  previousStartDate: Date
  previousEndDate: Date
} {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)

  const startDate = new Date(now)
  let days = 0

  if (timeRange === '7d') {
    days = 6 // Last 7 days including today
  } else if (timeRange === '30d') {
    days = 29 // Last 30 days including today
  } else if (timeRange === '90d') {
    days = 89 // Last 90 days including today
  }

  startDate.setDate(now.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  // Previous period
  const periodLength = days + 1
  const previousEndDate = new Date(startDate)
  previousEndDate.setDate(startDate.getDate() - 1)
  previousEndDate.setHours(23, 59, 59, 999)

  const previousStartDate = new Date(previousEndDate)
  previousStartDate.setDate(previousEndDate.getDate() - periodLength + 1)
  previousStartDate.setHours(0, 0, 0, 0)

  return {
    startDate,
    endDate,
    previousStartDate,
    previousEndDate,
  }
}

function getDescription(timeRange: TimeRange): string {
  if (timeRange === '7d') {
    return 'Дані за останні 7 днів з порівнянням з попереднім періодом'
  } else if (timeRange === '30d') {
    return 'Дані за останній місяць з порівнянням з попереднім періодом'
  } else {
    return 'Дані за останні 3 місяці з порівнянням з попереднім періодом'
  }
}

export function TrendChart() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<TimeRange>('30d')

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d')
    }
  }, [isMobile])

  const { startDate, endDate, previousStartDate, previousEndDate } =
    React.useMemo(() => getDateRange(timeRange), [timeRange])

  const { data: currentData, isLoading: isLoadingCurrent } =
    useSessionsByDateRange(startDate, endDate)
  const { data: previousData, isLoading: isLoadingPrevious } =
    useSessionsByDateRange(previousStartDate, previousEndDate)

  const chartData = React.useMemo(() => {
    if (!currentData || currentData.length === 0) {
      return []
    }

    // Create a map for previous data
    const previousMap = new Map<string, number>()
    if (previousData) {
      previousData.forEach((item) => {
        previousMap.set(item.date, item.durationSeconds)
      })
    }

    return currentData.map((item) => ({
      date: item.date,
      duration: Math.round(item.durationSeconds / 60),
      previousDuration: previousMap.has(item.date)
        ? Math.round((previousMap.get(item.date) || 0) / 60)
        : null,
    }))
  }, [currentData, previousData])

  const tickFormatter = React.useCallback(
    (value: string) => {
      const date = new Date(value)
      if (timeRange === '7d') {
        return date.toLocaleDateString('uk-UA', {
          weekday: 'short',
          day: 'numeric',
        })
      } else if (timeRange === '30d') {
        return date.toLocaleDateString('uk-UA', {
          day: 'numeric',
          month: 'short',
        })
      } else {
        return date.toLocaleDateString('uk-UA', {
          day: 'numeric',
          month: 'short',
        })
      }
    },
    [timeRange],
  )

  const minTickGap = timeRange === '7d' ? 32 : timeRange === '30d' ? 16 : 8

  const isLoading = isLoadingCurrent || isLoadingPrevious

  // Calculate average for current period
  const currentAvg =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((sum, item) => sum + item.duration, 0) /
            chartData.length,
        )
      : 0

  // Calculate average for previous period
  const previousAvg =
    chartData.length > 0
      ? Math.round(
          chartData.reduce(
            (sum, item) => sum + (item.previousDuration || 0),
            0,
          ) / chartData.length,
        )
      : 0

  const trend = currentAvg - previousAvg
  const trendPercent =
    previousAvg > 0 ? Math.round((trend / previousAvg) * 100) : 0

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Тренд часу практики</CardTitle>
          <CardDescription>Завантаження...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Завантаження даних...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Тренд часу практики</CardTitle>
        <CardDescription>
          {getDescription(timeRange)}
          {trend !== 0 && (
            <span
              className={`ml-2 ${
                trend > 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trendPercent)}%
            </span>
          )}
        </CardDescription>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-400">Середнє за період: </span>
              <span className="text-white font-semibold">{currentAvg} хв</span>
            </div>
            {previousAvg > 0 && (
              <div>
                <span className="text-gray-400">Попередній період: </span>
                <span className="text-gray-500">{previousAvg} хв</span>
              </div>
            )}
          </div>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => {
              if (value) setTimeRange(value as TimeRange)
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">7 днів</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 днів</ToggleGroupItem>
            <ToggleGroupItem value="90d">90 днів</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a period"
            >
              <SelectValue placeholder="30 днів" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                7 днів
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 днів
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                90 днів
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillDuration" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={1.0} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient
                id="fillPreviousDuration"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={minTickGap}
              tickFormatter={tickFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value} хв`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('uk-UA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                  indicator="dot"
                  formatter={(value, name) => {
                    if (name === 'duration') {
                      return [`${value} хвилин`, 'Поточний період']
                    }
                    if (name === 'previousDuration') {
                      return [`${value} хвилин`, 'Попередній період']
                    }
                    return [`${value} хвилин`, name]
                  }}
                />
              }
            />
            {previousAvg > 0 && (
              <Area
                dataKey="previousDuration"
                type="natural"
                fill="url(#fillPreviousDuration)"
                stroke="#64748b"
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            )}
            <Area
              dataKey="duration"
              type="natural"
              fill="url(#fillDuration)"
              stroke="#22c55e"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

