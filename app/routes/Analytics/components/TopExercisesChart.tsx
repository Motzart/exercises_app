import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useTopExercises } from '~/hooks/useAnalytics'
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
import { formatDuration } from '~/services/superbaseDb'

const chartConfig = {
  duration: {
    label: 'час практики',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

type Period = 'week' | 'month' | 'all'

function getPeriodDates(period: Period): { startDate?: Date; endDate?: Date } {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)

  if (period === 'week') {
    const dayOfWeek = now.getDay()
    const startDate = new Date(now)
    startDate.setDate(
      now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1),
    )
    startDate.setHours(0, 0, 0, 0)
    return { startDate, endDate }
  }

  if (period === 'month') {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    startDate.setHours(0, 0, 0, 0)
    return { startDate, endDate }
  }

  return {}
}

function getPeriodDescription(period: Period): string {
  if (period === 'week') {
    return 'Топ вправ за поточний тиждень'
  } else if (period === 'month') {
    return 'Топ вправ за поточний місяць'
  } else {
    return 'Топ вправ за весь час'
  }
}

export function TopExercisesChart() {
  const [period, setPeriod] = React.useState<Period>('month')
  const { startDate, endDate } = React.useMemo(
    () => getPeriodDates(period),
    [period],
  )

  const { data: topExercises = [], isLoading } = useTopExercises(
    10,
    startDate,
    endDate,
  )

  const chartData = React.useMemo(() => {
    return topExercises.map((exercise) => ({
      name:
        exercise.exerciseName.length > 20
          ? exercise.exerciseName.substring(0, 20) + '...'
          : exercise.exerciseName,
      fullName: exercise.exerciseName,
      duration: Math.round(exercise.totalDurationSeconds / 60), // Convert to minutes
      sessions: exercise.sessionCount,
    }))
  }, [topExercises])

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Топ вправ</CardTitle>
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

  if (chartData.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Топ вправ</CardTitle>
          <CardDescription>{getPeriodDescription(period)}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">
              Немає даних за вибраний період
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Топ вправ</CardTitle>
            <CardDescription>{getPeriodDescription(period)}</CardDescription>
          </div>
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger className="w-40" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Тиждень</SelectItem>
              <SelectItem value="month">Місяць</SelectItem>
              <SelectItem value="all">Весь час</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
        >
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 60, right: 20, top: 20, bottom: 20 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value} хв`}
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                    const data = props.payload as typeof chartData[0]
                    return [
                      `${value} хв (${data.sessions} сесій)`,
                      'Час практики',
                    ]
                  }}
                  labelFormatter={(value) => {
                    const data = chartData.find((d) => d.name === value)
                    return data?.fullName || value
                  }}
                />
              }
            />
            <Bar
              dataKey="duration"
              fill="rgba(74, 222, 128, 0.6)"
              stroke="#4ade80"
              strokeWidth={1}
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

