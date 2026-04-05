export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminAuthResponseDto {
  token: string;
  refreshToken: string;
  expiresAt: string;
  adminId: number;
  fullName: string;
  email: string;
  role: string;
}
