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
import { useSessionsByDayOfWeek } from '~/hooks/useTotalDuration';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const labels = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пятниця', 'Субота', 'Неділя'];

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Тиждень робочих сесій',
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
    y: {
      beginAtZero: true,
      ticks: {
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

  const chartData = {
    labels,
    datasets: [
      {
        label: 'робочі сесії',
        data: sessionsData || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  if (isLoading) {
    return <div className="text-center py-8">Завантаження...</div>;
  }

  return <Bar options={options} data={chartData} />;
};

export default GraphStats;
