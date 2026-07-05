import { Injectable, Logger } from '@nestjs/common';
import { TasService } from '../tas/tas.service';

interface QueueJoinedNotice {
  studentName: string;
  studentId: string;
  subjectName: string;
  labName: string;
  checkpointName: string | null;
  attempt: number;
}

/**
 * Sends Telegram DMs via the Bot API (https://api.telegram.org/bot<token>/sendMessage).
 * No-op if TELEGRAM_BOT_TOKEN is unset, so this is safe to call unconditionally.
 */
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;

  constructor(private readonly tasService: TasService) {}

  /**
   * Fire-and-forget — never awaited by callers, so a slow/unreachable Telegram
   * API can't delay or fail a student's queue join.
   */
  notifyQueueJoined(entry: QueueJoinedNotice) {
    if (!this.botToken) return;
    this.send(entry).catch((err) =>
      this.logger.warn(`Failed to send Telegram queue-joined notice: ${err.message}`),
    );
  }

  private async send(entry: QueueJoinedNotice) {
    const chatIds = await this.tasService.getNotifiableTelegramChatIds();
    if (chatIds.length === 0) return;

    const parts = [
      '🔔 มีนักศึกษาเข้าคิวใหม่',
      `${entry.studentName} (${entry.studentId})`,
      [entry.subjectName, entry.labName, entry.checkpointName].filter(Boolean).join(' · '),
    ];
    if (entry.attempt > 1) parts.push(`ครั้งที่ ${entry.attempt}`);
    const text = parts.join('\n');

    const results = await Promise.allSettled(
      chatIds.map((chatId) => this.sendMessage(chatId, text)),
    );
    for (const r of results) {
      if (r.status === 'rejected') {
        this.logger.warn(`Telegram send failed: ${r.reason}`);
      }
    }
  }

  private async sendMessage(chatId: string, text: string) {
    const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) {
      throw new Error(`Telegram API responded ${res.status} for chat ${chatId}`);
    }
  }
}
