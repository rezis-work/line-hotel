import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (
  userId: number,
  email: string,
  role: string
): string => {
  return jwt.sign(
    { userId, email, role, type: "access" },
    process.env.JWT_SECRET!,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (userId: number, email: string): string => {
  return jwt.sign(
    { userId, email, type: "refresh" },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};

export const generateTokens = (userId: number, email: string, role: string) => {
  const accessToken = generateAccessToken(userId, email, role);
  const refreshToken = generateRefreshToken(userId, email);

  return {
    accessToken,
    refreshToken,
    expiresIn: "15m",
  };
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};
