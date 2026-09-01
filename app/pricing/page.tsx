import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pricing from '@/components/Pricing';
import Faq from '@/components/Faq';

export const metadata = {
  title: '요금제 및 결제 | ReRoomAI',
  description: 'ReRoomAI AI 인테리어 리디자인 요금제 안내 및 무제한 크레딧 결제 페이지입니다.',
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main className="flex-1">
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
