export interface TokenRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  realm_access?: {
    roles?: string[];
  };
  exp?: number;
}
