import MobileAppView from '@/components/MobileAppView';

export const metadata = {
  title: 'RoomFit AI - AI Interior & Room Redesign',
  description: 'Transform room photos into photorealistic 4K interior designs, layout boosts, and exterior redesigns in 1-tap.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <MobileAppView />
    </main>
  );
}
