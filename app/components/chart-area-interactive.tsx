'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { useSessionsByDateRange } from '~/hooks/useTotalDuration';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '~/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { useIsMobile } from '~/hooks/use-mobile';

export const description = 'An interactive area chart';

const chartConfig = {
  duration: {
    label: 'хвилин',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

type TimeRange = '7d' | '30d' | '90d';

function getDateRange(timeRange: TimeRange): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);

  if (timeRange === '7d') {
    startDate.setDate(now.getDate() - 6); // Last 7 days including today
  } else if (timeRange === '30d') {
    startDate.setDate(now.getDate() - 29); // Last 30 days including today
  } else if (timeRange === '90d') {
    startDate.setDate(now.getDate() - 89); // Last 90 days including today
  }

  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

function getDescription(timeRange: TimeRange): string {
  if (timeRange === '7d') {
    return 'Дані за останні 7 днів';
  } else if (timeRange === '30d') {
    return 'Дані за останній місяць';
  } else {
    return 'Дані за останні 3 місяці';
  }
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<TimeRange>('7d');

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  const { startDate, endDate } = React.useMemo(
    () => getDateRange(timeRange),
    [timeRange],
  );

  const { data: sessionsData, isLoading } = useSessionsByDateRange(
    startDate,
    endDate,
  );

  const chartData = React.useMemo(() => {
    if (!sessionsData || sessionsData.length === 0) {
      return [];
    }

    return sessionsData.map((item) => ({
      date: item.date,
      duration: Math.round(item.durationSeconds / 60),
    }));
  }, [sessionsData]);

  const tickFormatter = React.useCallback(
    (value: string) => {
      const date = new Date(value);
      if (timeRange === '7d') {
        return date.toLocaleDateString('uk-UA', {
          weekday: 'short',
          day: 'numeric',
        });
      } else if (timeRange === '30d') {
        return date.toLocaleDateString('uk-UA', {
          day: 'numeric',
          month: 'short',
        });
      } else {
        return date.toLocaleDateString('uk-UA', {
          day: 'numeric',
          month: 'short',
        });
      }
    },
    [timeRange],
  );

  const minTickGap = timeRange === '7d' ? 32 : timeRange === '30d' ? 16 : 8;

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Час занятть</CardTitle>
          <CardDescription>Завантаження...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Завантаження даних...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Час занятть</CardTitle>
        <CardDescription>{getDescription(timeRange)}</CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => {
              if (value) setTimeRange(value as TimeRange);
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
              <SelectValue placeholder="7 днів" />
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
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillDuration" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={1.0} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
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
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('uk-UA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
                  }}
                  indicator="dot"
                  formatter={(value) => [`${value} хвилин`]}
                />
              }
            />
            <Area
              dataKey="duration"
              type="natural"
              fill="url(#fillDuration)"
              stroke="#22c55e"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
