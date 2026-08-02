import { env } from "@/config/env";

const TELEGRAM_API_URL = `https://api.telegram.org/bot${env.telegramBotToken}`;

export async function sendTelegramNotification(message: string): Promise<void> {
  try {
    await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.telegramAdminChatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    // لا نرمي خطأ هنا عمداً — فشل إشعار تليجرام يجب ألا يوقف العملية الأساسية
    console.error("فشل إرسال إشعار تليجرام:", err);
  }
}