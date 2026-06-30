import { describeRoute, validator, resolver } from "hono-openapi";
import { Hono } from "hono";
import z from "zod";
import { randomUUID } from "node:crypto";
import { db } from "../db/index.js";
import { user as UserTable } from "../db/schema/auth.js";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/crypto.js";
import { sign } from "hono/jwt";
import { env } from "../data/env.js";
import { auth } from "../auth.js";
import { downloadAndSaveAvatar } from "../lib/avatar.js";

const app = new Hono();

const JWT_EXPIRATION_SECONDS = 5 * 60; // 5 minutes

const registerSchema = z
  .object({
    email: z.string().email().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    name: z.string().optional(),
    image: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(6),
});

// Register a new user
app.post(
  "/register",
  describeRoute({
    summary: "Register new user",
    description: "Register a user with an email and password",
    responses: {
      201: {
        description: "User registered successfully",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                role: z.string(),
                image: z.string().nullable(),
                createdFrom: z.string().nullable(),
                createdAt: z.date(),
                updatedAt: z.date(),
              })
            ),
          },
        },
      },
      409: {
        description: "Email already in use",
      },
    },
  }),
  validator("json", registerSchema),
  async (c) => {
    const { email, password, name, image } = c.req.valid("json");
    
    const [existing] = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, email));
      
    if (existing != null) {
      return c.json({ error: "Email already in use" }, 409);
    }

    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    
    let localImagePath: string | null = null;
    if (image && image.startsWith("http")) {
      const downloaded = await downloadAndSaveAvatar(userId, image);
      if (downloaded) {
        localImagePath = downloaded;
      }
    } else if (image) {
      localImagePath = image;
    }

    const userName = name || email.split("@")[0];
    const now = new Date();

    await db
      .insert(UserTable)
      .values({
        id: userId,
        email,
        name: userName,
        passwordHash,
        createdFrom: "system",
        image: localImagePath,
        createdAt: now,
        updatedAt: now,
      });

    return c.json({
      id: userId,
      name: userName,
      email,
      role: "USER",
      image: localImagePath,
      createdFrom: "system",
      createdAt: now,
      updatedAt: now,
    }, 201);
  }
);

// Login a user
app.post(
  "/login",
  describeRoute({
    summary: "Login user",
    description: "Authenticate email/password and obtain a JWT bearer token",
    responses: {
      200: {
        description: "Successful login",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                token: z.string(),
                user: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                  role: z.string(),
                  image: z.string().nullable(),
                  createdFrom: z.string().nullable(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                }),
              })
            ),
          },
        },
      },
      401: {
        description: "Invalid email or password",
      },
    },
  }),
  validator("json", loginSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");
    
    const [user] = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, email));
      
    if (user == null || !user.passwordHash) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const now = Math.floor(Date.now() / 1000);

    const token = await sign(
      { exp: now + JWT_EXPIRATION_SECONDS, sub: user.id, email: user.email },
      env.JWT_SECRET,
      "HS256",
    );

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        createdFrom: user.createdFrom,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }
);

// Forward all other authentication requests to Better Auth (e.g., Google OAuth, sign-out)
app.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default app;