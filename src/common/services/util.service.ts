import { NormalResponse } from "@/shared/interfaces";
import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { plainToInstance } from "class-transformer";
import * as base64 from "base64-js";
import * as crypto from "crypto";
import * as sharp from "sharp";
import { EOrderStatus, EPayment } from "@/shared";
@Injectable()
export class UntilService {
  private readonly minioBucketName: string;

  private readonly minioPort: number;

  private readonly minioHost: string;

  private orderStatusMap: { [key in EOrderStatus]: string };

  constructor(private readonly config: ConfigService) {
    this.minioHost = this.config.getOrThrow("MINIO_ENDPOINT") ?? "localhost";
    this.minioPort = Number(this.config.getOrThrow("MINIO_PORT")) ?? 9000;
    this.minioBucketName = this.config.getOrThrow("MINIO_BUCKET_NAME");

    this.orderStatusMap = {
      [EOrderStatus.PENDING]: "Đang khởi tạo",
      [EOrderStatus.CREATE]: "Đã tạo đơn",
      [EOrderStatus.SHIPPING]: "Đang vận chuyển",
      [EOrderStatus.SUCCESS]: "Thành công",
      [EOrderStatus.CANCEL]: "Đã hủy",
      [EOrderStatus.RETURN]: "Đã trả lại",
    };
  }

  convertImageToBase64(file: Express.Multer.File): string {
    try {
      const base64String = base64.fromByteArray(new Uint8Array(file.buffer));
      return base64String;
    } catch (err) {
      throw new BadRequestException(
        `Error converting image to Base64: ${err.message}`,
      );
    }
  }

  async convertBase64ToImage(
    base64String: string,
  ): Promise<Express.Multer.File> {
    try {
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

      const fileBuffer = Buffer.from(base64.toByteArray(base64Data));

      const webpBuffer = await sharp(fileBuffer).webp().toBuffer();

      const file: Express.Multer.File = {
        fieldname: "file",
        originalname: crypto.randomUUID() + ".webp",
        encoding: "7bit",
        mimetype: "image/webp",
        buffer: webpBuffer,
        size: webpBuffer.length,
        path: "",
        destination: "",
        filename: crypto.randomUUID() + ".webp",
        stream: null,
      };

      return file;
    } catch (err) {
      throw new BadRequestException(
        `Error converting Base64 to image: ${err.message}`,
      );
    }
  }

  convertPayment(payment: EPayment): string {
    switch (payment) {
      case EPayment.COD:
        return "Thanh toán khi nhận hàng COD";
      case EPayment.BANK:
        return "Thanh toán qua ngân hàng";
      case EPayment.MOMO:
        return "Thanh toán qua ứng dụng MoMo";
      default:
        throw new BadRequestException("Invalid payment method!");
    }
  }

  convertPrice(price: number): string {
    return price.toLocaleString("de-DE").replace(/,/g, ".");
  }

  convertStatusOrder(status: EOrderStatus): string {
    return this.orderStatusMap[status] || "Trạng thái không hợp lệ";
  }

  combinePhotoPaths(fileName: string): string {
    const protocol = this.minioHost === "localhost" ? "http" : "https";
    return `${protocol}://${this.minioHost}:${this.minioPort}/${this.minioBucketName}/${fileName}`;
  }

  getCurrentTime() {
    return Math.floor(Date.now() / 1000);
  }

  mapToDto<T, U>(entityOrEntities: T | T[], dtoClass: { new (): U }): U | U[] {
    if (Array.isArray(entityOrEntities)) {
      return entityOrEntities.map((entity) =>
        plainToInstance(dtoClass, entity, {
          excludeExtraneousValues: true,
        }),
      );
    } else {
      return plainToInstance(dtoClass, entityOrEntities, {
        excludeExtraneousValues: true,
      });
    }
  }

  buildSuccessResponse(data: unknown): NormalResponse {
    return {
      httpCode: HttpStatus.OK,
      message: "Success!",
      data,
    };
  }

  buildCreatedResponse(data: unknown): NormalResponse {
    return {
      httpCode: HttpStatus.CREATED,
      message: "Success!",
      data,
    };
  }

  buildCustomResponse(
    httpCode: number,
    data: unknown,
    message: string,
  ): NormalResponse {
    return {
      httpCode,
      data,
      message,
    };
  }
}
