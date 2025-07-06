import cron from "node-cron";
import { logger } from "../utils/logger";
import { JobConfig } from "../types";

import { exampleJob } from "./example.job";

const jobs: JobConfig[] = [
  {
    name: "exampleJob",
    schedule: "*/30 * * * *",
    enabled: true,
  },
];

export const initCronJobs = (): void => {
  logger.info("Initializing cron jobs...");

  jobs.forEach((job) => {
    if (!job.enabled) {
      logger.info(`Job ${job.name} is disabled`);
      return;
    }

    try {
      if (!cron.validate(job.schedule)) {
        throw new Error(`Invalid cron expression: ${job.schedule}`);
      }

      cron.schedule(job.schedule, async () => {
        logger.info(`Running job: ${job.name}`);

        try {
          switch (job.name) {
            case "exampleJob":
              await exampleJob();
              break;
            default:
              logger.warn(`Unknown job: ${job.name}`);
          }

          logger.info(`Job ${job.name} completed successfully`);
        } catch (error) {
          logger.error(
            `Error running job ${job.name}: ${(error as Error).message}`
          );
        }
      });

      logger.info(`Job ${job.name} scheduled successfully: ${job.schedule}`);
    } catch (error) {
      logger.error(
        `Error scheduling job ${job.name}: ${(error as Error).message}`
      );
    }
  });
};
