import dotenv from "dotenv";

dotenv.config();

type envTypes = {
    MONGODB_URI: string
    PORT: number
    JWT_SECRET: string
    JWT_EXPIRE: number
    JWT_REFRESH_SECRET: string
    JWT_REFRESH_EXPIRE: number
};

export const ENV: envTypes = {
    MONGODB_URI: process.env.MONGODB_URI!,
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRE: Number(process.env.JWT_EXPIRE),
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_REFRESH_EXPIRE: Number(process.env.JWT_REFRESH_EXPIRE)
};
