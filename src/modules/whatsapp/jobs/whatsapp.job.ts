import { container } from "tsyringe";
import { SendDailyMessagesUseCase } from "../features/notifications/use-cases/send-daily-messages.use-case";
import { ILogger } from "@/shared/logger/logger.interface";
import { CronJob } from "cron";

export function createWhatsAppJob(
  sendDailyMessagesUseCase: SendDailyMessagesUseCase,
  logger: ILogger
): CronJob {
  const cronInterval = process.env.WHATSAPP_CRON_INTERVAL || "0 8 * * *";

  return new CronJob(
    cronInterval,
    async () => {
      try {
        logger.info("Starting scheduled WhatsApp messages");
        await sendDailyMessagesUseCase.execute();
        logger.info("Scheduled WhatsApp messages completed");
      } catch (error) {
        logger.error(
          `Error in scheduled WhatsApp messages: ${(error as Error).message}`
        );
      }
    },
    null,
    true,
    "America/Sao_Paulo"
  );
}

export async function initializeWhatsAppJobs(): Promise<void> {
  const sendDailyMessagesUseCase = container.resolve(SendDailyMessagesUseCase);
  const logger = container.resolve<ILogger>("ILogger");

  createWhatsAppJob(sendDailyMessagesUseCase, logger);
  const cronInterval = process.env.WHATSAPP_CRON_INTERVAL || "0 8 * * *";

  logger.info(
    `WhatsApp jobs initialized successfully (scheduled: ${cronInterval})`
  );
}
