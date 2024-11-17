import { NormalResponse } from "@/shared/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { plainToInstance } from "class-transformer";

@Injectable()
export class UntilService {
  private readonly minioBucketName: string;

  private readonly minioPort: number;

  private readonly minioHost: string;

  constructor(private readonly config: ConfigService) {
    this.minioHost = this.config.getOrThrow("MINIO_ENDPOINT") ?? "localhost";
    this.minioPort = Number(this.config.getOrThrow("MINIO_PORT")) ?? 9000;
    this.minioBucketName = this.config.getOrThrow("MINIO_BUCKET_NAME");
  }

  combinePhotoPaths(fileName: string): string {
    return `http://${this.minioHost}:${this.minioPort}/${this.minioBucketName}/${fileName}`;
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
