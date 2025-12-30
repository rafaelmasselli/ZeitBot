import { ILogger } from "@/shared/logger/logger.interface";

export const mockLogger: jest.Mocked<ILogger> = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  setDefaultContext: jest.fn(),
  clearDefaultContext: jest.fn(),
};

export const createMockLogger = (): jest.Mocked<ILogger> => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  setDefaultContext: jest.fn(),
  clearDefaultContext: jest.fn(),
});

