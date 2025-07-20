import { NewsController } from "../controllers";
import { createNewsJob } from "./news.job";

export function initJobs(newsController: NewsController): void {
  // createNewsJob(newsController);
  console.log("Jobs initialized");
}
