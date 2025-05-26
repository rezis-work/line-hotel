import { db } from "../config/index";
import { rooms, roomTypes, type NewRoom, type NewRoomType } from "../db/schema";
import { eq, and } from "drizzle-orm";

export class RoomService {
  static async createRoomType(data: {
    name: string;
    description?: string;
    basePrice: number;
    capacity: number;
    bedType: string;
    size?: number;
    amenities?: string[];
  }) {
    const newRoomType: NewRoomType = {
      name: data.name,
      description: data.description,
      basePrice: data.basePrice.toString(),
      capacity: data.capacity,
      bedType: data.bedType,
      size: data.size,
      amenities: data.amenities ? JSON.stringify(data.amenities) : null,
    };

    const [created] = await db
      .insert(roomTypes)
      .values(newRoomType)
      .returning();

    return {
      ...created,
      amenities: created.amenities ? JSON.parse(created.amenities) : [],
    };
  }

  static async getAllRoomTypes() {
    const types = await db
      .select()
      .from(roomTypes)
      .where(eq(roomTypes.isActive, true));

    return types.map((type) => ({
      ...type,
      amenities: type.amenities ? JSON.parse(type.amenities) : [],
    }));
  }

  static async getRoomTypeById(id: number) {
    const [roomType] = await db
      .select()
      .from(roomTypes)
      .where(and(eq(roomTypes.id, id), eq(roomTypes.isActive, true)));

    if (!roomType) {
      throw new Error("Room type not found");
    }

    return {
      ...roomType,
      amenities: roomType.amenities ? JSON.parse(roomType.amenities) : [],
    };
  }
}
