import {
  Injectable,
  NestMiddleware,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class FileValidationMiddleware implements NestMiddleware {
  private allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  private maxSize = 5 * 1024 * 1024;

  use(req: Request, _: Response, next: NextFunction) {
    const file = req.file;

    if (!file) {
      throw new UnsupportedMediaTypeException("File upload wrong!");
    }

    if (file.size > this.maxSize) {
      throw new PayloadTooLargeException(
        "File size must be less than or equal to 5MB.",
      );
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        "Invalid file type. Only image files and .txt, .xlsx are allowed.",
      );
    }

    next();
  }
}
