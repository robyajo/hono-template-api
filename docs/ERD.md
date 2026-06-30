# Entity-Relationship Diagram (ERD)

This document contains the Entity-Relationship Diagram (ERD) and table details for the Kilex Hono database schema.

---

## 📊 ER Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ SESSION : "has many"
    USER ||--o{ ACCOUNT : "has many"

    USER {
        varchar(36) id PK
        text name
        varchar(255) email UK
        boolean email_verified
        text image
        varchar(50) role "default 'USER'"
        text password_hash
        datetime created_at
        datetime updated_at
    }

    SESSION {
        varchar(36) id PK
        datetime expires_at
        varchar(255) token UK
        datetime created_at
        datetime updated_at
        text ip_address
        text user_agent
        varchar(36) user_id FK
    }

    ACCOUNT {
        varchar(36) id PK
        text account_id
        text provider_id
        varchar(36) user_id FK
        text access_token
        text refresh_token
        text id_token
        datetime access_token_expires_at
        datetime refresh_token_expires_at
        text scope
        text password
        datetime created_at
        datetime updated_at
    }

    VERIFICATION {
        varchar(36) id PK
        text identifier
        text value
        datetime expires_at
        datetime created_at
        datetime updated_at
    }
```

---

## 🗃️ Table Specifications

### 1. `user` Table
Stores basic information for registered users. Handles both custom credential registrations and social OAuth logins.
*   `id`: Primary Key (UUID length 36).
*   `name`: Plain text name.
*   `email`: Email address (unique, indexed).
*   `emailVerified`: Boolean flag to check verified status.
*   `image`: URL string pointing to avatar images (usually populated via Google login).
*   `role`: User authorization level (`ADMIN` or `USER`). Default is `USER`.
*   `passwordHash`: Scrypt-hashed password (used only for custom email/password auth).
*   `createdAt`: Timestamp of registration.
*   `updatedAt`: Timestamp of last edit.

---

### 2. `session` Table
Tracks active Better Auth cookie sessions.
*   `id`: Primary Key.
*   `expiresAt`: Expiry date of the session.
*   `token`: Unique lookup token.
*   `createdAt` & `updatedAt`: Timestamps.
*   `ipAddress` & `userAgent`: Client metadata.
*   `userId`: Foreign Key referencing `user.id`. Configured with **`ON DELETE CASCADE`** so sessions clear automatically if a user is deleted.

---

### 3. `account` Table
Stores linked credential providers (e.g. `google`, `credentials`, etc.) for users.
*   `id`: Primary key.
*   `accountId`: External account ID provided by the OAuth provider.
*   `providerId`: The provider name (e.g. `'google'`, `'github'`).
*   `userId`: Foreign Key referencing `user.id` (`ON DELETE CASCADE`).
*   `accessToken`, `refreshToken`, `idToken`: Token values returned by OAuth provider.
*   `accessTokenExpiresAt`, `refreshTokenExpiresAt`: Token expiry timestamps.
*   `scope`: Authorized API scopes.
*   `password`: Hashed credentials password (managed by Better Auth email/password module, separate from our custom `user.passwordHash`).

---

### 4. `verification` Table
Manages temporary keys used during authentication tasks (like email verifications and password resets).
*   `id`: Primary Key.
*   `identifier`: Lookup identity (e.g. email or username).
*   `value`: Hashed token value.
*   `expiresAt`: Time when the token expires.
