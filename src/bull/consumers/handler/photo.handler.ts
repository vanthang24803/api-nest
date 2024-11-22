import { PhotoDelete } from "@/modules/photos/dto";

export type RemovePhotoHandler = {
  productId: string;
  files: PhotoDelete[];
};

export type UploadPhotoHandler = {
  productId: string;
  files: string[];
};
