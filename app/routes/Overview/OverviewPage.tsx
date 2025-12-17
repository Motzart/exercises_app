import GraphStats from './components/GraphStats';
import OverviewStats from './components/OverviewStats';
import SliderStats from './components/SliderStats';

const OverviewPage = () => {
  return (
    <div className="container mx-auto relative isolate overflow-hidden py-16">
      <OverviewStats />
      <SliderStats />
      <GraphStats />
    </div>
  );
};

export default OverviewPage;
