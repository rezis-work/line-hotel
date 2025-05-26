import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import z from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

export const schemas = {
  register: z.object({
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name too long"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name too long"),
    phone: z.string().optional(),
  }),

  login: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),

  createRoomType: z.object({
    name: z
      .string()
      .min(1, "Room type name is required")
      .max(100, "Name too long"),
    description: z.string().optional(),
    basePrice: z.number().positive("Base price must be positive"),
    capacity: z
      .number()
      .int()
      .min(1, "Capacity must be at least 1")
      .max(10, "Capacity too high"),
    bedType: z.enum(["single", "double", "queen", "king"]),
    size: z.number().int().positive("Size must be positive").optional(),
    amenities: z.array(z.string()).optional(),
  }),

  updateRoomType: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    basePrice: z.number().positive().optional(),
    capacity: z.number().int().min(1).max(10).optional(),
    bedType: z.enum(["single", "double", "queen", "king"]).optional(),
    size: z.number().int().positive().optional(),
    amenities: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),

  createRoom: z.object({
    roomNumber: z
      .string()
      .min(1, "Room number is required")
      .max(20, "Room number too long"),
    roomTypeId: z.number().int().positive("Valid room type is required"),
    floor: z.number().int().min(1, "Floor must be at least 1"),
    notes: z.string().optional(),
  }),

  updateRoom: z.object({
    roomNumber: z.string().min(1).max(20).optional(),
    roomTypeId: z.number().int().positive().optional(),
    floor: z.number().int().min(1).optional(),
    status: z
      .enum([
        "available",
        "occupied",
        "maintenance",
        "out_of_order",
        "cleaning",
      ])
      .optional(),
    isActive: z.boolean().optional(),
    notes: z.string().optional(),
  }),
};
