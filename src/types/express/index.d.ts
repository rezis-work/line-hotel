declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;
        type: string;
      };
    }
  }
}

export {};
