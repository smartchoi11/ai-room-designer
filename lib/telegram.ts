/**
 * 텔레그램 봇 실시간 결제 알림 유틸리티
 */

export type PaymentNotificationParams = {
  planName: string;
  amountFormatted: string;
  paymentMethod: string;
  customerEmail?: string;
};

export async function sendTelegramPaymentNotification(params: PaymentNotificationParams): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('ℹ️ TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID가 설정되지 않아 알림이 스킵되었습니다.');
    return false;
  }

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const message = `🔔 <b>[RoomFit AI 결제 완료 알림]</b> 💳

• <b>요금제</b>: ${params.planName}
• <b>결제 금액</b>: ${params.amountFormatted}
• <b>결제 수단</b>: ${params.paymentMethod}
${params.customerEmail ? `• <b>고객 이메일</b>: ${params.customerEmail}\n` : ''}• <b>결제 시각</b>: ${now}

🎉 새로운 결제가 성공적으로 처리되었습니다!`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    return data.ok === true;
  } catch (error) {
    console.error('텔레그램 알림 전송 에러:', error);
    return false;
  }
}
