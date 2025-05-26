import { and, eq } from "drizzle-orm";
import { db } from "../config/index";
import {
  users,
  refreshTokens,
  type NewUser,
  type NewRefreshToken,
} from "../db/schema";
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyRefreshToken,
} from "../utils/auth";

export class AuthService {
  static async register(userData: NewUser) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));

    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(userData.password);
    const newUser: NewUser = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: "customer",
    };

    const [createdUser] = await db.insert(users).values(newUser).returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
    });

    const tokens = generateTokens(
      createdUser.id,
      createdUser.email,
      createdUser.role
    );
    await AuthService.storeRefreshToken(createdUser.id, tokens.refreshToken);

    return {
      user: {
        createdUser,
      },
      ...tokens,
    };
  }

  static async login(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || !user.isActive) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const tokens = generateTokens(user.id, user.email, user.role);
    await AuthService.storeRefreshToken(user.id, tokens.refreshToken);

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  static async refreshToken(refreshTokenValue: string) {
    const decoded = verifyRefreshToken(refreshTokenValue);

    const [tokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, refreshTokenValue),
          eq(refreshTokens.isRevoked, false)
        )
      );

    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      throw new Error("Invalid or expired refresh token");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!user || !user.isActive) {
      throw new Error("User not found");
    }

    const tokens = generateTokens(user.id, user.email, user.role);

    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, tokenRecord.id));

    await AuthService.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  static async logout(refreshTokenValue: string) {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.token, refreshTokenValue));
    return true;
  }

  private static async storeRefreshToken(userId: number, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
    });
  }
}
