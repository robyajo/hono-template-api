import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connectionPool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123",
    database: process.env.DB_NAME || "db_mituni_kilex",
});

export const db = drizzle(connectionPool);