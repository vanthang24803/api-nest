import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";
import { Readable } from "stream";
import * as crypto from "crypto";
import * as mime from "mime-types";

@Injectable()
export class UploadService {
  private readonly minioClient: Minio.Client;

  private readonly bucketName: string;

  constructor(private config: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.config.getOrThrow("MINIO_ENDPOINT"),
      port: Number(this.config.getOrThrow("MINIO_PORT")) ?? 9000,
      useSSL: false,
      accessKey: this.config.getOrThrow("MINIO_ACCESS_KEY"),
      secretKey: this.config.getOrThrow("MINIO_SECRET_KEY"),
    });
    this.bucketName = this.config.getOrThrow("MINIO_BUCKET_NAME");
  }

  public async uploadImage(file: Express.Multer.File): Promise<string> {
    const fileName = `assert-${Date.now()}-${crypto.randomUUID()}${this.getExtensionFile(file)}`;

    const fileStream = Readable.from(file.buffer);

    const fileSize = file.buffer.length;

    const mimeType =
      mime.lookup(file.originalname) || "application/octet-stream";

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        fileStream,
        fileSize,
        {
          "Content-Type": mimeType,
        },
      );
      return fileName;
    } catch (error) {
      throw new BadRequestException(
        `Error uploading file to MinIO: ${error.message}`,
      );
    }
  }

  public async removeImage(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } catch (error) {
      throw new BadRequestException(
        `Error removing file from MinIO: ${error.message}`,
      );
    }
  }

  private getExtensionFile(fileName: Express.Multer.File): string {
    return fileName.originalname.substring(
      fileName.originalname.lastIndexOf("."),
    );
  }
}
