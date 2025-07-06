import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiServiceOptions, AppError } from "../types";
import { logger } from "../utils/logger";

export class ApiService {
  protected client: AxiosInstance;
  protected baseURL: string;

  constructor(options: ApiServiceOptions) {
    this.baseURL = options.baseURL;

    this.client = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Request to ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`Request error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Response from ${response.config.url}: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          logger.error(
            `API error ${error.config.url}: ${status} - ${JSON.stringify(
              data
            )}`
          );

          throw new AppError(
            data.message || `External API error: ${status}`,
            status
          );
        }

        if (error.request) {
          logger.error(`No response from API ${error.config.url}`);
          throw new AppError("No response from external API", 503);
        }

        logger.error(`Configuration error: ${error.message}`);
        throw new AppError(`Configuration error: ${error.message}`, 500);
      }
    );
  }

  protected async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  protected async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  protected async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  protected async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}
