import { container } from ".";
import { DatabaseService } from "../../database/connect";

export const registerDatabase = () => {
  container.registerSingleton("DatabaseService", DatabaseService);
};
