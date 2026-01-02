import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent } from '~/components/ui/card';
import { useSessionsByDayOfWeek } from '~/hooks/useTotalDuration';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function getWeekDates(): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Початок поточного тижня (понеділок)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);

  // Генеруємо масив дат для 7 днів тижня
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(
      date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }),
    );
  }

  return dates;
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const seconds = context.parsed.y;
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;

          if (hours > 0) {
            return `${hours}г ${remainingMinutes}хв`;
          }
          return `${minutes}хв`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
      },
      ticks: {
        stepSize: 1800, // 30 минут в секундах
        callback: function (value: any) {
          const seconds = value;
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;

          if (hours > 0) {
            return `${hours}г ${remainingMinutes}хв`;
          }
          return `${minutes}хв`;
        },
      },
    },
  },
};

const GraphStats = () => {
  const { data: sessionsData, isLoading } = useSessionsByDayOfWeek();
  const labels = getWeekDates();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'робочі сесії',
        data: sessionsData || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(74, 222, 128, 0.6)',
        borderColor: '#4ade80',
        borderWidth: 1,
        borderRadius: 32,
      },
    ],
  };

  if (isLoading) {
    return <div className="text-center py-8">Завантаження...</div>;
  }

  return (
    <Card className="@container/card">
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 h-[400px]">
        <Bar options={options} data={chartData} />
      </CardContent>
    </Card>
  );
};

export default GraphStats;
