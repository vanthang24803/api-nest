export interface IPagination<T> {
  page: number;
  size: number;
  limit: number;
  offset: number;

  result: T[];
}
