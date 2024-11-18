import { PhotoDelete } from "@/modules/photos/dto";

export type RemovePhotoHandler = {
  productId: string;
  files: PhotoDelete[];
};
