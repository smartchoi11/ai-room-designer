import { NextResponse } from 'next/server';

export async function GET() {
  const assetlinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.hwanggeumson.roomfit',
        sha256_cert_fingerprints: [
          'D3:75:A9:D0:B7:8B:98:72:78:5B:D6:B1:14:FB:DF:1B:B1:0A:E0:3F:C6:1C:BF:DE:D1:E5:11:BC:E5:58:BA:FE',
        ],
      },
    },
  ];

  return NextResponse.json(assetlinks, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
