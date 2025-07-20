import { logger } from "@/utils";
import { container } from ".";
import config from "..";

export const registerConfig = () => {
  container.registerInstance("Config", config);
  container.registerInstance("ILogger", logger);
};
