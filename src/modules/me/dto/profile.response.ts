import { Expose } from "class-transformer";

export class ProfileResponse {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  fullName: string;

  @Expose()
  avatar: string;

  @Expose()
  email: string;

  @Expose()
  roles: string[];
}
