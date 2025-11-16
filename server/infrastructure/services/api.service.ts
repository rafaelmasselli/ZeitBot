import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export interface ApiServiceOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export abstract class ApiService {
  protected client: AxiosInstance;

  constructor(options: ApiServiceOptions) {
    this.client = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
}

