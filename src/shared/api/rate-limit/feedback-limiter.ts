import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { FEEDBACK_DAILY_LIMIT } from "@/shared/config/feedback";

// Не более FEEDBACK_DAILY_LIMIT обращений в день на пользователя (см. ТЗ п.6.8) —
// чтобы форма не стала каналом для спама на почту компании.
const feedbackRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(FEEDBACK_DAILY_LIMIT, "1 d"),
  prefix: "gate:feedback",
});

export async function checkFeedbackRateLimit(userId: string): Promise<boolean> {
  const { success } = await feedbackRatelimit.limit(userId);
  return success;
}
