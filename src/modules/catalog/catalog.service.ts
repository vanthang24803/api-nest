import { UntilService } from "@/common";
import { Catalog } from "@/database/entities";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CatalogRequest, CatalogResponse } from "./dto";
import { NormalResponse } from "@/shared";

@Injectable()
export class CatalogService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    @InjectRepository(Catalog)
    private readonly catalogRepository: Repository<Catalog>,
  ) {}

  public async save(request: CatalogRequest): Promise<NormalResponse> {
    try {
      const newCatalog = this.catalogRepository.create({
        ...request,
      });

      await this.catalogRepository.save(newCatalog);

      return this.util.buildCreatedResponse({
        message: "Catalog created successfully!",
      });
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  public async findAll(): Promise<NormalResponse> {
    const catalogs = await this.catalogRepository.find();

    return this.util.buildSuccessResponse(
      this.util.mapToDto(catalogs, CatalogResponse),
    );
  }

  public async findOneById(id: string): Promise<NormalResponse> {
    const catalog = await this.catalogRepository.findOneBy({
      id,
    });

    if (!catalog) {
      throw new NotFoundException("Catalog not found!");
    }

    return this.util.buildSuccessResponse(
      this.util.mapToDto(catalog, CatalogResponse),
    );
  }

  public async update(
    id: string,
    request: CatalogRequest,
  ): Promise<NormalResponse> {
    const catalog = await this.catalogRepository.findOneBy({
      id,
    });

    if (!catalog) {
      throw new NotFoundException("Catalog not found!");
    }

    await this.catalogRepository.update(catalog.id, {
      ...request,
    });

    return this.util.buildSuccessResponse({
      message: "Updated catalog successfully!",
    });
  }

  public async remove(id: string): Promise<NormalResponse> {
    const catalog = await this.catalogRepository.findOneBy({
      id,
    });

    if (!catalog) {
      throw new NotFoundException("Catalog not found!");
    }

    await this.catalogRepository.remove(catalog);

    return this.util.buildSuccessResponse({
      message: "Deleted catalog successfully!",
    });
  }
}
