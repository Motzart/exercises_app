import { KPICards } from './components/KPICards'
import { TrendChart } from './components/TrendChart'
import { TopExercisesChart } from './components/TopExercisesChart'
import { DayOfWeekChart } from './components/DayOfWeekChart'
import { SectionCards } from '~/components/section-cards'

const AnalyticsPage = () => {
  return (
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-8">
            Аналітика
          </h1>
          
          {/* KPI Cards */}
          <div className="mb-8">
            {/* <KPICards /> */}
            <SectionCards />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Trend Chart - Full Width */}
            <div className="lg:col-span-2">
              <TrendChart />
            </div>

            {/* Top Exercises Chart */}
            <div className="lg:col-span-1">
              <TopExercisesChart />
            </div>

            {/* Day of Week Chart */}
            <div className="lg:col-span-1">
              <DayOfWeekChart />
            </div>
          </div>
        </div>
  )
}

export default AnalyticsPage

