import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { botToken, chatId, message } = await req.json();

    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
    const targetChat = chatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !targetChat) {
      return NextResponse.json({
        success: false,
        message: 'Telegram BOT_TOKEN or CHAT_ID environment variables are not set. (Demo mode logged).',
        preview: message
      });
    }

    // Call official Telegram Bot API (sendMessage endpoint)
    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const res = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChat,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();

    if (data.ok) {
      return NextResponse.json({ success: true, result: data.result });
    } else {
      return NextResponse.json({ success: false, error: data.description }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
