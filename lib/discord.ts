/**
 * 디스코드(Discord) 웹훅 실시간 결제 알림 유틸리티
 */

export type DiscordPaymentParams = {
  planName: string;
  amountFormatted: string;
  paymentMethod: string;
  customerEmail?: string;
};

export async function sendDiscordPaymentNotification(params: DiscordPaymentParams): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('ℹ️ DISCORD_WEBHOOK_URL 환경변수가 설정되지 않아 알림이 스킵되었습니다.');
    return false;
  }

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const embedPayload = {
    username: 'ReRoomAI 결제 알림이',
    avatar_url: 'https://ai-room-smart-designer-choi.vercel.app/icon.svg',
    embeds: [
      {
        title: '🎉 [ReRoomAI] 신규 결제가 완료되었습니다!',
        color: 0x2ecc71, // 상큼한 초록색
        fields: [
          {
            name: '📦 결제 요금제',
            value: params.planName,
            inline: true,
          },
          {
            name: '💰 결제 금액',
            value: params.amountFormatted,
            inline: true,
          },
          {
            name: '💳 결제 수단',
            value: params.paymentMethod,
            inline: true,
          },
          {
            name: '⏰ 결제 시각',
            value: now,
            inline: false,
          },
        ],
        footer: {
          text: 'ReRoomAI Monetization Engine • 실시간 결제 푸시 시스템',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embedPayload),
    });

    return res.ok || res.status === 204;
  } catch (error) {
    console.error('디스코드 웹훅 알림 전송 에러:', error);
    return false;
  }
}
