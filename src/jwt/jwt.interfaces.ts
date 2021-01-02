export const JWT_OPTIONS = 'JWT_OPTIONS';

export interface JwtOptions {
  secret: string;
}

export interface IPayload {
  id: number | string;
}
