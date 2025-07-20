import { BBCNewsService, BrazilIndeedService, NewsService } from "@/services";
import { container } from ".";

export const registerServices = () => {
  container.registerSingleton("BBCNewsService", BBCNewsService);
  container.registerSingleton("BrazilIndeedService", BrazilIndeedService);
  container.registerSingleton("NewsService", NewsService);
};
