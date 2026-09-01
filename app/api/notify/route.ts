import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordPaymentNotification } from '@/lib/discord';
import { sendTelegramPaymentNotification } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const { planName, amountFormatted, paymentMethod, customerEmail } = await req.json();

    const params = {
      planName: planName || '알 수 없는 요금제',
      amountFormatted: amountFormatted || '0원',
      paymentMethod: paymentMethod || '간편결제',
      customerEmail,
    };

    // 디스코드 및 텔레그램 알림 둘 다 시도 (설정된 환경변수에 따라 자동 작동)
    const [discordSent, telegramSent] = await Promise.all([
      sendDiscordPaymentNotification(params),
      sendTelegramPaymentNotification(params),
    ]);

    return NextResponse.json({
      success: discordSent || telegramSent,
      discordSent,
      telegramSent,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Notify API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
}
