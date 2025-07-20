import { container } from ".";
import { NewsRepository } from "../../repository";

export const registerRepositories = () => {
  container.registerSingleton("NewsRepository", NewsRepository);
};
