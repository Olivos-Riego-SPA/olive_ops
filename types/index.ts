export interface FetchResponse<T = any> {
  code: number;
  data?: T;
  error?: any;
}
