'use client';

import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  useTotalDuration,
  useTodayDuration,
  useYesterdayDuration,
  useExercisesCount,
} from '~/hooks/useTotalDuration';

function formatDurationToUkrainian(duration: string | undefined): string {
  if (!duration) return '00г. 00хв.';

  // Конвертуємо формат "25h:04m" в "25г. 04хв."
  const match = duration.match(/(\d+)h:(\d+)m/);
  if (match) {
    const hours = match[1];
    const minutes = match[2].padStart(2, '0');
    return `${hours}г. ${minutes}хв.`;
  }

  // Якщо формат вже український, повертаємо як є
  return duration;
}

function parseDurationToSeconds(duration: string | undefined): number {
  if (!duration) return 0;

  // Парсимо формат "25h:04m"
  const englishMatch = duration.match(/(\d+)h:(\d+)m/);
  if (englishMatch) {
    const hours = parseInt(englishMatch[1], 10);
    const minutes = parseInt(englishMatch[2], 10);
    return hours * 3600 + minutes * 60;
  }

  // Парсимо формат "25г. 04хв."
  const ukrainianMatch = duration.match(/(\d+)г\.\s*(\d+)хв\./);
  if (ukrainianMatch) {
    const hours = parseInt(ukrainianMatch[1], 10);
    const minutes = parseInt(ukrainianMatch[2], 10);
    return hours * 3600 + minutes * 60;
  }

  return 0;
}

function calculatePercentageChange(
  today: string | undefined,
  yesterday: string | undefined,
): { percentage: number; isIncrease: boolean } | null {
  if (!today || !yesterday) return null;

  const todaySeconds = parseDurationToSeconds(today);
  const yesterdaySeconds = parseDurationToSeconds(yesterday);

  if (yesterdaySeconds === 0) {
    // Якщо учора було 0, а сьогодні є час - це збільшення на 100%
    if (todaySeconds > 0) {
      return { percentage: 100, isIncrease: true };
    }
    return null;
  }

  const change = ((todaySeconds - yesterdaySeconds) / yesterdaySeconds) * 100;
  const percentage = Math.abs(Math.round(change * 10) / 10); // Округлюємо до 1 знака після коми

  return {
    percentage,
    isIncrease: change > 0,
  };
}

export function SectionCards() {
  const { data: totalDuration, isLoading } = useTotalDuration();
  const { data: todayDuration, isLoading: isLoadingToday } = useTodayDuration();
  const { data: yesterdayDuration, isLoading: isLoadingYesterday } =
    useYesterdayDuration();
  const { data: exercisesCount, isLoading: isLoadingExercises } =
    useExercisesCount();

  const changeData = calculatePercentageChange(
    todayDuration,
    yesterdayDuration,
  );

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Усього часу</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? '...' : formatDurationToUkrainian(totalDuration)}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline" className="bg-green-500 text-white">
              <IconTrendingUp />
              +00.00%
            </Badge> */}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Маємо тенденцію до збільшення{' '}
            <IconTrendingUp className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">Загальний час</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Час Сьогодні</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoadingToday ? '...' : formatDurationToUkrainian(todayDuration)}
          </CardTitle>
          <CardAction>
            {changeData && !isLoadingToday && !isLoadingYesterday ? (
              <Badge
                variant="outline"
                className={
                  changeData.isIncrease
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }
              >
                {changeData.isIncrease ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {changeData.isIncrease ? '+' : '-'}
                {changeData.percentage}%
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-500 text-white">
                -
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {changeData && !isLoadingToday && !isLoadingYesterday ? (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {changeData.isIncrease
                ? `Час збільшився на ${changeData.percentage}%`
                : `Час зменшився на ${changeData.percentage}%`}
              {changeData.isIncrease ? (
                <IconTrendingUp className="size-4 text-green-500" />
              ) : (
                <IconTrendingDown className="text-red-500 size-4" />
              )}
            </div>
          ) : (
            <div className="line-clamp-1 flex gap-2 font-medium">
              Загальний час за сьогодні
            </div>
          )}
          <div className="text-muted-foreground">Загальний час за сьогодні</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Час учора</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoadingYesterday
              ? '...'
              : formatDurationToUkrainian(yesterdayDuration)}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline" className="bg-green-500 text-white">
              <IconTrendingUp />
              +12.5%
            </Badge> */}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention{' '}
            <IconTrendingUp className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">
            Загальний час за минулу добу
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Кіль-ть вправ</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoadingExercises ? '...' : exercisesCount || 0}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline" className="bg-green-500 text-white">
              <IconTrendingUp />
              +2
            </Badge> */}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Кількість вправ збільшилась{' '}
            <IconTrendingUp className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">Кількість доданих вправ</div>
        </CardFooter>
      </Card>
    </div>
  );
}
