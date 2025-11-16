import { container } from "tsyringe";
import { SaveNewsUseCase } from "@modules/news";
import { ILogger } from "@shared/logger/logger.interface";
import { createNewsJob } from "./news.job";

export function initializeJobs(): void {
  const saveNewsUseCase = container.resolve(SaveNewsUseCase);
  const logger = container.resolve<ILogger>("ILogger");

  const newsJob = createNewsJob(saveNewsUseCase, logger);
  
  logger.info("Jobs initialized successfully");
}

