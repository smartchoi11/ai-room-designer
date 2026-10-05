import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount, planId } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '결제 검증에 필요한 필수 파라미터(paymentKey, orderId, amount)가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 환경 변수에 설정된 시크릿 키, 없으면 기본 공식 테스트 시크릿 키 사용
    const secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3mqEyAbnZv';
    const basicAuth = Buffer.from(`${secretKey}:`).toString('base64');

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const result = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error('Toss Payments confirm failed:', result);
      return NextResponse.json(
        { error: result.message || '결제 승인 처리 중 오류가 발생했습니다.', details: result },
        { status: tossResponse.status }
      );
    }

    // 결제 성공 알림 전송 (Discord 또는 Telegram)
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🎉 **[RoomFit AI 결제 성공!]**\n- 주문명: ${result.orderName}\n- 결제금액: ${result.totalAmount.toLocaleString()}원\n- 결제수단: ${result.method}\n- 주문번호: ${result.orderId}`,
          }),
        });
      }
    } catch (notifyErr) {
      console.warn('Webhook notification failed:', notifyErr);
    }

    return NextResponse.json({
      success: true,
      payment: result,
      planId,
    });
  } catch (error: any) {
    console.error('Payment confirm internal error:', error);
    return NextResponse.json(
      { error: error.message || '결제 승인 서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
