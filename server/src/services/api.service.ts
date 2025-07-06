import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiServiceOptions, AppError } from '../types';
import { logger } from '../utils/logger';

/**
 * Classe base para serviços de API
 */
export class ApiService {
  protected client: AxiosInstance;
  protected baseURL: string;

  constructor(options: ApiServiceOptions) {
    this.baseURL = options.baseURL;
    
    // Configuração do cliente Axios
    this.client = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Interceptor para logs e tratamento de erros
    this.setupInterceptors();
  }

  /**
   * Configura interceptores para requisições e respostas
   */
  private setupInterceptors(): void {
    // Interceptor de requisição
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Requisição para ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`Erro na requisição: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // Interceptor de resposta
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Resposta de ${response.config.url}: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          logger.error(`Erro na API ${error.config.url}: ${status} - ${JSON.stringify(data)}`);
          
          throw new AppError(
            data.message || `Erro na API externa: ${status}`,
            status
          );
        }
        
        if (error.request) {
          logger.error(`Sem resposta da API ${error.config.url}`);
          throw new AppError('Sem resposta da API externa', 503);
        }
        
        logger.error(`Erro de configuração: ${error.message}`);
        throw new AppError(`Erro de configuração: ${error.message}`, 500);
      }
    );
  }

  /**
   * Método GET genérico
   */
  protected async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  /**
   * Método POST genérico
   */
  protected async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * Método PUT genérico
   */
  protected async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * Método DELETE genérico
   */
  protected async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
} 