import { PhotoResponse } from "@/modules/photos/dto";

export class ReviewResponse {
  id: string;
  content?: string;
  star: number;
  photos: PhotoResponse[];
  author: AuthorResponse;
  createdAt: Date;
}

export class AuthorResponse {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  numberPhone?: string;
}
