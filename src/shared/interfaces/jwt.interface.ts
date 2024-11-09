export interface Payload {
  id: string;
  fullName: string;
  avatar: string;
  roles: string[];
}

export interface JwtSign {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  payload: Payload;
  exp?: number;
  iat?: number;
}
