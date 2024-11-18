import { OptionRequest } from "@/modules/options/dto";

export type CreateProductHandler = {
  productId: string;
  options: OptionRequest[];
  photos: Express.Multer.File[];
};
