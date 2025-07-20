import { container } from "tsyringe";

import "reflect-metadata";
import { registerConfig } from "./config.container";
import { registerDatabase } from "./database.container";
import { registerRepositories } from "./repository.container";
import { registerServices } from "./service.container";
import { registerRoutes } from "./routes.container";
import { registerControllers } from "./controller.container";

registerConfig();
registerDatabase();
registerRepositories();
registerServices();
registerControllers();
registerRoutes();

export { container };
