export interface IPagination<T> {
  page: number;
  size: number;
  limit: number;
  totalPage: number;

  result: T[];
}
