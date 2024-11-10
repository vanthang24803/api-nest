import { NormalResponse } from "@/shared/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

@Injectable()
export class UntilService {
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
      code: HttpStatus.OK,
      data,
      isSuccess: true,
    };
  }

  buildCreatedResponse(data: unknown): NormalResponse {
    return {
      code: HttpStatus.CREATED,
      data,
      isSuccess: true,
    };
  }

  buildCustomResponse(
    code: number,
    data: unknown,
    message: string,
  ): NormalResponse {
    return {
      isSuccess: code === 200 || code === 201 ? true : false,
      code,
      data,
      message,
    };
  }
}
