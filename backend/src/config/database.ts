import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);

import fs from "fs";
import path from "path";

export const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log(
      "PostgreSQL connected:",
      result.rows[0]
    );

    // Ensure database schema exists
    try {
      const schemaPath = path.join(process.cwd(), "schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf-8");
      await pool.query(schema);
      console.log("Database schema applied successfully.");
    } catch (schemaError) {
      console.error("Failed to apply database schema:", schemaError);
    }

  } catch (error) {
    console.error(
      "PostgreSQL connection failed:",
      error
    );
  }
};