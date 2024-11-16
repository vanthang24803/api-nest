import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();

    const message =
      typeof responseBody === "string"
        ? responseBody
        : responseBody?.message || "An error occurred";

    const error =
      typeof responseBody === "string"
        ? responseBody
        : responseBody?.error || "An error occurred";

    response.status(status).json({
      isSuccess: false,
      httpCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
