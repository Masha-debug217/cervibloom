import { useEffect, useState } from 'react';
import client from '../api/client';
import HeroSection from '../components/home/HeroSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import StatsSection from '../components/home/StatsSection';
import TrustStrip from '../components/home/TrustStrip';

export default function Home() {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    client.get('/facilities/').then(res => setFacilities(res.data)).catch(() => {});
  }, []);

  const facilityCount = facilities.length;
  const countyCount = new Set(facilities.map(f => f.county)).size;

  return (
    <div>
      <HeroSection facilityCount={facilityCount} countyCount={countyCount} />
      <HowItWorksSection />
      <StatsSection facilityCount={facilityCount} countyCount={countyCount} />
      <TrustStrip />
    </div>
  );
}
