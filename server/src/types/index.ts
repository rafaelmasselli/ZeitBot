export enum INewsPlatform {
  BBC = "BBC",
  G1 = "G1",
  BRAZIL_INDEED = "BRAZIL_INDEED",
}

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ApiServiceOptions {
  public baseURL!: string;
  public timeout?: number;
  public headers?: Record<string, string>;
}