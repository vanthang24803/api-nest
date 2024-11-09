export interface Payload {
  id: string;
  fullName: string;
  avatar: string;
}

export interface JwtSign {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  fullName: string;
  avatar: string;
}
