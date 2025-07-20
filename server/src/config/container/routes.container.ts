import { container } from ".";
import { AppRoutes, HealthRoutes, NewsRoutes } from "../../routes";

export const registerRoutes = () => {
  container.registerSingleton("HealthRoutes", HealthRoutes);
  container.registerSingleton("NewsRoutes", NewsRoutes);
  container.registerSingleton("AppRoutes", AppRoutes);
};
