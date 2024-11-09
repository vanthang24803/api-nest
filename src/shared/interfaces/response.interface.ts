export interface NormalResponse {
  code: number;
  data: any;
  message?: string;
  status: Status;
}

type Status = "success" | "fail" | "pending" | "completed";
