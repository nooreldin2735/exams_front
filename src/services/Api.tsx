import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

export class ApiService {
  private static axiosInstance: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api/v0',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Generic GET method
   * @param endpoint - The API endpoint
   * @param config - Optional Axios config
   * @returns Promise with the data
   */
  static async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST method
   * @param endpoint - The API endpoint
   * @param data - The payload to send
   * @param config - Optional Axios config
   * @returns Promise with the data
   */
  static async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      console.log(data);
      const response: AxiosResponse<T> = await this.axiosInstance.post(endpoint, data);
      console.log(response);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Centralized error handling for non-standard server responses
   */
  private static handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Keep the original error if strict handling isn't possible due to non-standard format
      // But define usage properties if available
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      // Construct a meaningful error message
      let message = axiosError.message;
      if (data && typeof data === 'object' && 'message' in data) {
        // Try to find a message field if existing
        message = (data as any).message;
      } else if (typeof data === 'string') {
        message = data;
      }

      console.error(`API Error [${status}]:`, message, data);

      // Return a new Error or custom error object
      return new Error(message || 'An unexpected API error occurred');
    }

    // Non-Axios error
    console.error('Unexpected Error:', error);
    return new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}

export default ApiService;
