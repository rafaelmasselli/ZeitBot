import { NewsController } from "../controllers";
import { logger } from "../utils";
import { CronJob } from "cron";

export function createNewsJob(newsController: NewsController): CronJob {
  return new CronJob(
    "*/1 * * * *",
    async () => {
      try {
        logger.info("Iniciando processamento de notícias");
        await newsController.saveNews();
        logger.info("Processamento de notícias finalizado");
      } catch (error) {
        logger.error(`Erro ao processar notícias: ${(error as Error).message}`);
      }
    },
    null,
    true,
    "America/Sao_Paulo"
  );
}
