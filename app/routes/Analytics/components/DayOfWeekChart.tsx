import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useSessionsByDayOfWeek } from '~/hooks/useTotalDuration'
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

const chartConfig = {
  duration: {
    label: 'час практики',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

function getWeekDates(): string[] {
  const now = new Date()
  const dayOfWeek = now.getDay()

  // Початок поточного тижня (понеділок)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))
  startOfWeek.setHours(0, 0, 0, 0)

  // Генеруємо масив дат для 7 днів тижня
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    dates.push(
      date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }),
    )
  }

  return dates
}

function getDayNames(): string[] {
  return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
}

export function DayOfWeekChart() {
  const { data: sessionsData, isLoading } = useSessionsByDayOfWeek()
  const labels = getWeekDates()
  const dayNames = getDayNames()

  const chartData = useMemo(() => {
    if (!sessionsData || sessionsData.length === 0) {
      return dayNames.map((name, index) => ({
        day: name,
        date: labels[index],
        duration: 0,
      }))
    }

    return dayNames.map((name, index) => ({
      day: name,
      date: labels[index],
      duration: Math.round((sessionsData[index] || 0) / 60), // Convert to minutes
    }))
  }, [sessionsData, labels, dayNames])

  // Calculate average
  const avgDuration =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((sum, item) => sum + item.duration, 0) /
            chartData.length,
        )
      : 0

  // Find max day
  const maxDay = chartData.reduce(
    (max, item) => (item.duration > max.duration ? item : max),
    chartData[0] || { day: '', duration: 0 },
  )

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Розподіл по днях тижня</CardTitle>
          <CardDescription>Завантаження...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Завантаження даних...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Розподіл по днях тижня</CardTitle>
        <CardDescription>
          Час практики за поточний тиждень
          {avgDuration > 0 && (
            <span className="ml-2 text-gray-400">
              (середнє: {avgDuration} хв, найбільше: {maxDay.day} - {maxDay.duration} хв)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
                  formatter={(value) => [`${value} хвилин`, 'Час практики']}
                  labelFormatter={(value, payload) => {
                    const data = payload?.[0]?.payload as typeof chartData[0]
                    return data?.date || value
                  }}
                />
              }
            />
            <Bar
              dataKey="duration"
              fill="rgba(74, 222, 128, 0.6)"
              stroke="#4ade80"
              strokeWidth={1}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

