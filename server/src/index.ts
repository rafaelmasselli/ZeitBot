import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { initCronJobs } from "./jobs";
import routes from "./routes";
import { logger } from "./utils/logger";
import config from "./config";
import { errorHandler } from "./middlewares/error.middleware";
import { AppError } from "./types";

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Rota não encontrada: ${req.originalUrl}`, 404));
});

app.use(errorHandler);

const PORT: number = config.PORT;
const server = app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT} em modo ${config.NODE_ENV}`);

  initCronJobs();
  logger.info("Jobs cron inicializados");
});

process.on("uncaughtException", (error: Error) => {
  logger.error(`Exceção não capturada: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason: Error) => {
  logger.error(`Promessa rejeitada não tratada: ${reason.message}`);
  logger.error(reason.stack);

  server.close(() => {
    process.exit(1);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000);
});

export default app;
