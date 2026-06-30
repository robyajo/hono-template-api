import "dotenv/config";

export const env = {
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 8000,
    JWT_SECRET: process.env.JWT_SECRET || "super-secret-jwt-key-change-me",
    DB_USER: process.env.DB_USER || "root",
    DB_PASSWORD: process.env.DB_PASSWORD || "123",
    DB_NAME: process.env.DB_NAME || "db_mituni_kilex",
    DB_HOST: process.env.DB_HOST || "127.0.0.1",
    DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
};
