import { relations } from "drizzle-orm";
import { index, mysqlTable, varchar, text, boolean, datetime } from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: varchar("role", { length: 50 }).default("USER").notNull(),
    passwordHash: text("password_hash"),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" })
        .$onUpdate(() => new Date())
        .notNull(),
});

export const session = mysqlTable(
    "session",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
        token: varchar("token", { length: 255 }).notNull().unique(),
        createdAt: datetime("created_at", { mode: "date" }).notNull(),
        updatedAt: datetime("updated_at", { mode: "date" })
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: varchar("user_id", { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => ({
        userIdIdx: index("session_userId_idx").on(table.userId),
    }),
);

export const account = mysqlTable(
    "account",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: varchar("user_id", { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: datetime("access_token_expires_at", { mode: "date" }),
        refreshTokenExpiresAt: datetime("refresh_token_expires_at", { mode: "date" }),
        scope: text("scope"),
        password: text("password"),
        createdAt: datetime("created_at", { mode: "date" }).notNull(),
        updatedAt: datetime("updated_at", { mode: "date" })
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => ({
        userIdIdx: index("account_userId_idx").on(table.userId),
    }),
);

export const verification = mysqlTable(
    "verification",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
        createdAt: datetime("created_at", { mode: "date" }).notNull(),
        updatedAt: datetime("updated_at", { mode: "date" })
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => ({
        identifierIdx: index("verification_identifier_idx").on(table.identifier),
    }),
);

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));