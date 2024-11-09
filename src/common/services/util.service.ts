import { NormalResponse } from "@/shared/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class UntilService {
  getCurrentTime() {
    return Math.floor(Date.now() / 1000);
  }

  mapper<T, U>(source: T): U {
    const target = {} as U;

    Object.keys(source).forEach((key) => {
      if (source[key] !== undefined) {
        (target as any)[key] = source[key];
      }
    });

    return target;
  }

  buildSuccessResponse(data: unknown): NormalResponse {
    return {
      code: HttpStatus.OK,
      data,
      status: "success",
    };
  }

  buildCreatedResponse(data: unknown): NormalResponse {
    return {
      code: HttpStatus.CREATED,
      data,
      status: "success",
    };
  }

  buildCustomResponse(
    code: number,
    data: unknown,
    message: string,
  ): NormalResponse {
    return {
      code,
      data,
      message,
      status: code === 200 || code === 201 ? "success" : "fail",
    };
  }
}
