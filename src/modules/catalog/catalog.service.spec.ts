import { Test, TestingModule } from "@nestjs/testing";
import { CatalogService } from "./catalog.service";
import { Catalog } from "@/database/entities";
import { Repository } from "typeorm";
import { BadRequestException, Logger, NotFoundException } from "@nestjs/common";
import { UntilService } from "@/common";
import { CatalogRequest } from "./dto";

describe("CatalogService", () => {
  let catalogService: CatalogService;
  let catalogRepository: Repository<Catalog>;
  let utilService: UntilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: Repository,
          useValue: {
            findOneBy: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UntilService,
          useValue: {
            buildCreatedResponse: jest.fn(),
            buildSuccessResponse: jest.fn(),
            mapper: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    catalogService = module.get<CatalogService>(CatalogService);
    catalogRepository = module.get<Repository<Catalog>>(Repository);
    utilService = module.get<UntilService>(UntilService);
  });

  describe("save", () => {
    it("should successfully create a new catalog", async () => {
      const request: CatalogRequest = { name: "New Catalog" };
      const createdCatalog = { id: "123", ...request };
      catalogRepository.create = jest.fn().mockReturnValue(createdCatalog);
      catalogRepository.save = jest.fn().mockResolvedValue(createdCatalog);
      utilService.buildCreatedResponse = jest.fn().mockReturnValue({
        message: "Catalog created successfully!",
      });

      const response = await catalogService.save(request);

      expect(response).toEqual({
        message: "Catalog created successfully!",
      });
      expect(catalogRepository.create).toHaveBeenCalledWith(request);
      expect(catalogRepository.save).toHaveBeenCalledWith(createdCatalog);
    });

    it("should throw BadRequestException when there is an error", async () => {
      const request: CatalogRequest = { name: "New Catalog" };
      const error = new Error("Test Error");
      catalogRepository.create = jest.fn().mockReturnValue({ ...request });
      catalogRepository.save = jest.fn().mockRejectedValue(error);
      utilService.buildCreatedResponse = jest.fn();

      await expect(catalogService.save(request)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("should return all catalogs", async () => {
      const catalogs = [
        { id: "1", name: "Catalog 1" },
        { id: "2", name: "Catalog 2" },
      ];
      catalogRepository.find = jest.fn().mockResolvedValue(catalogs);
      utilService.buildSuccessResponse = jest.fn().mockReturnValue(catalogs);

      const response = await catalogService.findAll();

      expect(response).toEqual(catalogs);
      expect(catalogRepository.find).toHaveBeenCalled();
    });
  });

  describe("findOneById", () => {
    it("should return a catalog if it exists", async () => {
      const catalog = { id: "1", name: "Catalog 1" };
      catalogRepository.findOneBy = jest.fn().mockResolvedValue(catalog);
      utilService.buildSuccessResponse = jest.fn().mockReturnValue(catalog);

      const response = await catalogService.findOneById("1");

      expect(response).toEqual(catalog);
      expect(catalogRepository.findOneBy).toHaveBeenCalledWith({ id: "1" });
    });

    it("should throw NotFoundException if catalog does not exist", async () => {
      catalogRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(catalogService.findOneById("1")).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update the catalog if it exists", async () => {
      const request: CatalogRequest = { name: "Updated Catalog" };
      const existingCatalog = { id: "1", name: "Old Catalog" };
      catalogRepository.findOneBy = jest
        .fn()
        .mockResolvedValue(existingCatalog);
      catalogRepository.update = jest.fn().mockResolvedValue({});

      const response = await catalogService.update("1", request);

      expect(response).toEqual({ message: "Updated catalog successfully!" });
      expect(catalogRepository.update).toHaveBeenCalledWith("1", request);
    });

    it("should throw NotFoundException if catalog does not exist", async () => {
      const request: CatalogRequest = { name: "Updated Catalog" };
      catalogRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(catalogService.update("1", request)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove a catalog if it exists", async () => {
      const catalog = { id: "1", name: "Catalog 1" };
      catalogRepository.findOneBy = jest.fn().mockResolvedValue(catalog);
      catalogRepository.remove = jest.fn().mockResolvedValue({});

      const response = await catalogService.remove("1");

      expect(response).toEqual({ message: "Deleted catalog successfully!" });
      expect(catalogRepository.remove).toHaveBeenCalledWith(catalog);
    });

    it("should throw NotFoundException if catalog does not exist", async () => {
      catalogRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(catalogService.remove("1")).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
