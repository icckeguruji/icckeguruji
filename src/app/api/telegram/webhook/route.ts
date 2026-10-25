import { NextRequest, NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { PaymentRequest, User, Announcement } from '@/types';

// Helper to send message via Telegram Bot API
async function sendTelegramMessage(botToken: string, chatId: number | string, text: string, replyMarkup?: object) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
  }
}

// Helper to answer callback query
async function answerCallbackQuery(botToken: string, callbackQueryId: string, text: string) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: true,
      }),
    });
  } catch (err) {
    console.error('Failed to answer callback query:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
    }

    const update = await req.json();

    // 1. Handle Inline Button Callback Queries (Approve / Reject UPI Payment)
    if (update.callback_query) {
      const cb = update.callback_query;
      const dataStr = cb.data as string;
      const chatId = cb.message?.chat?.id;

      const data = getStoredData();

      if (dataStr.startsWith('approve_')) {
        const paymentId = dataStr.replace('approve_', '');
        const payment = data.payments.find((p: PaymentRequest) => p.id === paymentId);

        if (payment) {
          // Update payment status
          payment.status = 'approved';
          payment.updatedAt = new Date().toISOString();

          // Enroll student
          const student = data.students.find((s: User) => s.id === payment.userId || s.phone === payment.userPhone);
          if (student) {
            if (!student.enrolledCourseIds.includes(payment.courseId)) {
              student.enrolledCourseIds.push(payment.courseId);
            }
          }

          // If current demo user matches, update demo user as well
          if (data.user.id === payment.userId || data.user.phone === payment.userPhone) {
            if (!data.user.enrolledCourseIds.includes(payment.courseId)) {
              data.user.enrolledCourseIds.push(payment.courseId);
            }
          }

          saveStoredData('PAYMENTS', data.payments);
          saveStoredData('STUDENTS', data.students);
          saveStoredData('USER', data.user);

          await answerCallbackQuery(botToken, cb.id, `✅ Payment Approved! ${payment.userName} is now enrolled.`);

          if (chatId) {
            await sendTelegramMessage(
              botToken,
              chatId,
              `✅ <b>Payment Approved Successfully!</b>\n\n` +
              `👤 <b>Student:</b> ${payment.userName} (${payment.userPhone})\n` +
              `📚 <b>Course:</b> ${payment.courseTitle}\n` +
              `💰 <b>Amount:</b> ₹${payment.amount}\n` +
              `🔢 <b>UTR:</b> <code>${payment.utrNumber}</code>\n` +
              `🎓 <i>Student can now access live lectures & notes immediately!</i>`
            );
          }
        } else {
          await answerCallbackQuery(botToken, cb.id, '❌ Payment request not found.');
        }
        return NextResponse.json({ ok: true });
      }

      if (dataStr.startsWith('reject_')) {
        const paymentId = dataStr.replace('reject_', '');
        const payment = data.payments.find((p: PaymentRequest) => p.id === paymentId);

        if (payment) {
          payment.status = 'rejected';
          payment.updatedAt = new Date().toISOString();
          saveStoredData('PAYMENTS', data.payments);

          await answerCallbackQuery(botToken, cb.id, `❌ Payment Rejected for ${payment.userName}`);

          if (chatId) {
            await sendTelegramMessage(
              botToken,
              chatId,
              `❌ <b>Payment Rejected!</b>\n\n` +
              `Student: ${payment.userName} (${payment.userPhone})\n` +
              `UTR: <code>${payment.utrNumber}</code> marked as Invalid.`
            );
          }
        }
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Handle Text Messages & Commands
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      const data = getStoredData();

      // Main Menu Keyboard
      const mainKeyboard = {
        keyboard: [
          [{ text: '📊 Dashboard Stats' }, { text: '💳 Pending Approvals' }],
          [{ text: '📅 Today Timetable' }, { text: '📝 Pending DPPs' }],
          [{ text: '📢 Quick Broadcast' }, { text: '⚙️ Settings Info' }]
        ],
        resize_keyboard: true,
        is_persistent: true,
      };

      // /start or /help
      if (text === '/start' || text === '/help') {
        const welcomeMsg =
          `🙏 <b>Pranam Guruji! Welcome to ICC KE GURUJI Command Center.</b>\n\n` +
          `Aap apne mobile se Telegram par hi pure coaching platform ko manage kar sakte hain:\n\n` +
          `• <b>/stats</b> - Total students, active batches & revenue\n` +
          `• <b>/pending</b> - Pending UPI payments with 1-Click Approve buttons\n` +
          `• <b>/broadcast &lt;message&gt;</b> - Website ticker par alert bhejne ke liye\n` +
          `• <b>/timetable</b> - Aaj ki live classes routine\n` +
          `• <b>/dpp</b> - Pending student homework submissions\n\n` +
          `<i>Niche diye gaye buttons par tap karke shuru karein:</i>`;

        await sendTelegramMessage(botToken, chatId, welcomeMsg, mainKeyboard);
        return NextResponse.json({ ok: true });
      }

      // /stats or '📊 Dashboard Stats'
      if (text === '/stats' || text === '📊 Dashboard Stats') {
        const approved = data.payments.filter((p: PaymentRequest) => p.status === 'approved');
        const pending = data.payments.filter((p: PaymentRequest) => p.status === 'pending');
        const revenue = approved.reduce((sum: number, p: PaymentRequest) => sum + p.amount, 0);

        const statsMsg =
          `📊 <b>ICC KE GURUJI — Real-Time Stats</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `👥 <b>Total Students:</b> ${data.students.length}\n` +
          `📚 <b>Active Batches:</b> ${data.courses.length}\n` +
          `🔴 <b>Scheduled Lectures:</b> ${data.lessons.length}\n` +
          `💰 <b>Direct UPI Revenue:</b> ₹${revenue.toLocaleString('en-IN')}\n` +
          `⏳ <b>Pending Approvals:</b> ${pending.length}\n` +
          `📝 <b>DPP Homeworks:</b> ${(data.dpps || []).length}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<i>Tip: Type /pending to review payments waiting for approval.</i>`;

        await sendTelegramMessage(botToken, chatId, statsMsg, mainKeyboard);
        return NextResponse.json({ ok: true });
      }

      // /pending or '💳 Pending Approvals'
      if (text === '/pending' || text === '💳 Pending Approvals') {
        const pending = data.payments.filter((p: PaymentRequest) => p.status === 'pending');

        if (pending.length === 0) {
          await sendTelegramMessage(
            botToken,
            chatId,
            `🎉 <b>Sabhi payments verify ho chuki hain!</b>\nAbhi koi pending UPI approval nahi hai.`,
            mainKeyboard
          );
          return NextResponse.json({ ok: true });
        }

        await sendTelegramMessage(
          botToken,
          chatId,
          `⏳ <b>Found ${pending.length} Pending UPI Payment(s):</b>\nVerify details and tap Approve/Reject below:`,
          mainKeyboard
        );

        for (const p of pending) {
          const cardText =
            `👤 <b>Student:</b> ${p.userName}\n` +
            `📱 <b>Phone:</b> ${p.userPhone}\n` +
            `📚 <b>Course:</b> ${p.courseTitle}\n` +
            `💰 <b>Amount:</b> ₹${p.amount}\n` +
            `🔢 <b>12-Digit UTR:</b> <code>${p.utrNumber}</code>\n` +
            `🕒 <b>Date:</b> ${new Date(p.createdAt).toLocaleString('en-IN')}`;

          const inlineKeyboard = {
            inline_keyboard: [
              [
                { text: '✅ Approve & Enroll', callback_data: `approve_${p.id}` },
                { text: '❌ Reject UTR', callback_data: `reject_${p.id}` }
              ]
            ]
          };

          await sendTelegramMessage(botToken, chatId, cardText, inlineKeyboard);
        }
        return NextResponse.json({ ok: true });
      }

      // /broadcast or '📢 Quick Broadcast'
      if (text.startsWith('/broadcast') || text === '📢 Quick Broadcast') {
        const msgContent = text.replace('/broadcast', '').trim();

        if (!msgContent) {
          await sendTelegramMessage(
            botToken,
            chatId,
            `📢 <b>Live Broadcast Command Usage:</b>\n\n` +
            `Aapko jo message website ticker aur students ke notice board par lagana hai, aise type karein:\n\n` +
            `<code>/broadcast Aaj shaam 7 baje Physics live class shuru hogi!</code>`,
            mainKeyboard
          );
          return NextResponse.json({ ok: true });
        }

        const newAnn: Announcement = {
          id: `ann-${Date.now()}`,
          title: 'Guruji Official Broadcast',
          message: msgContent,
          category: 'live_class',
          date: 'Just now',
          isPinned: true,
        };

        const updatedAnnouncements = [newAnn, ...data.announcements];
        saveStoredData('ANNOUNCEMENTS', updatedAnnouncements);

        await sendTelegramMessage(
          botToken,
          chatId,
          `✅ <b>Broadcast Published!</b>\n\n` +
          `Aapka message website header notice ticker aur student dashboard par live ho chuka hai:\n` +
          `<i>"${msgContent}"</i>`,
          mainKeyboard
        );
        return NextResponse.json({ ok: true });
      }

      // /timetable or '📅 Today Timetable'
      if (text === '/timetable' || text === '📅 Today Timetable') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDay = days[new Date().getDay()];

        const todaySlots = data.timetable.filter((t) => t.day === todayDay);

        let ttMsg = `📅 <b>Timetable for Today (${todayDay}):</b>\n━━━━━━━━━━━━━━━━━━━━\n`;

        if (todaySlots.length === 0) {
          ttMsg += `Aaj koi scheduled class nahi hai (Self Study Day).`;
        } else {
          todaySlots.forEach((slot, i) => {
            ttMsg += `${i + 1}. <b>${slot.subject}</b>\n`;
            ttMsg += `   ⏰ Time: ${slot.time}\n`;
            ttMsg += `   📖 Topic: ${slot.topic}\n`;
            ttMsg += `   👨‍🏫 Faculty: ${slot.faculty}\n\n`;
          });
        }

        await sendTelegramMessage(botToken, chatId, ttMsg, mainKeyboard);
        return NextResponse.json({ ok: true });
      }

      // /dpp or '📝 Pending DPPs'
      if (text === '/dpp' || text === '📝 Pending DPPs') {
        const pendingSubs = (data.dppSubmissions || []).filter((s) => s.status === 'pending');

        if (pendingSubs.length === 0) {
          await sendTelegramMessage(
            botToken,
            chatId,
            `✅ <b>Sabhi DPP homework checked hain!</b>\nAbhi koi pending student submission nahi hai.`,
            mainKeyboard
          );
        } else {
          let dppMsg = `📝 <b>Pending Homework Submissions (${pendingSubs.length}):</b>\n\n`;
          pendingSubs.slice(0, 5).forEach((s, idx) => {
            dppMsg += `${idx + 1}. <b>${s.userName}</b> (${s.userPhone})\n`;
            dppMsg += `   Submitted: ${s.submittedAt}\n`;
            dppMsg += `   Answer Preview: <i>"${s.answerText.slice(0, 80)}..."</i>\n\n`;
          });
          dppMsg += `<i>Aap website admin panel par jaakar marks aur feedback de sakte hain.</i>`;

          await sendTelegramMessage(botToken, chatId, dppMsg, mainKeyboard);
        }
        return NextResponse.json({ ok: true });
      }

      // '⚙️ Settings Info'
      if (text === '⚙️ Settings Info') {
        const cfg = data.config;
        const infoMsg =
          `⚙️ <b>Institute Settings Overview</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🏫 <b>Name:</b> ${cfg.coachingName}\n` +
          `💳 <b>UPI ID:</b> <code>${cfg.upiId}</code>\n` +
          `📱 <b>WhatsApp:</b> ${cfg.whatsappNumber}\n` +
          `✈️ <b>Telegram:</b> ${cfg.telegramGroupLink}\n` +
          `✉️ <b>Email:</b> ${cfg.contactEmail}`;

        await sendTelegramMessage(botToken, chatId, infoMsg, mainKeyboard);
        return NextResponse.json({ ok: true });
      }

      // Default fallback for any other text
      await sendTelegramMessage(
        botToken,
        chatId,
        `🤖 Guruji, maine aapka message read kiya: "<i>${text}</i>"\n\n` +
        `Menu options use karne ke liye /stats ya /pending type karein.`,
        mainKeyboard
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Telegram webhook error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
