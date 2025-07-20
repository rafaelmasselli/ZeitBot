import dotenv from "dotenv";
import { Config } from "../types";

dotenv.config();

const config: Config = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost:27017/zeitbot",
};

export default config;
