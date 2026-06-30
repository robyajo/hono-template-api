---
name: storage
description: Guides on using and extending the Laravel-style file storage system (logs, public uploads, and private uploads) in the project.
---

# Project Storage Architecture (Laravel-style)

This project adopts a Laravel-like file storage architecture under the `storage/` root directory. Use this skill when implementing file uploads, accessing stored files, or writing log files.

## 📂 Storage Directory Structure

The `storage/` directory is organized as follows:

*   **`storage/log/`**: Contains error logs and application activity logs.
    *   `log.log`: Main log file.
*   **`storage/app/private/`**: Contains private user files and assets that require authentication or special authorization checks to access (not public).
*   **`storage/app/public/`**: Contains public assets, such as uploaded user avatars or shared media.

---

## 💾 Logging Files

All application logs (HTTP logs and error stacks) are processed via [src/lib/logger.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/OPENSOURCE/hono-template-api/src/lib/logger.ts) and saved directly to:
```
storage/log/log.log
```

---

## 📤 File Upload & Avatar Guidelines

### 1. Avatars (User Profiles)
When a user registers/logins via Google or an Admin creates/updates a user with a remote image URL, the system automatically downloads the image using `downloadAndSaveAvatar` and saves it to:
```
storage/app/public/avatars/<userId>-<timestamp>.<ext>
```
The user's database `image` record is updated to point to the local path: `/storage/avatars/<filename>`.

### 2. Public Uploads (e.g. public attachments):
- Save files to: `storage/app/public/`
- These files are served statically by Hono under the `/storage/*` route mapping to `./storage/app/public/` (configured in `src/index.ts`).

### 3. Private Uploads (e.g. invoices, user documents):
- Save files to: `storage/app/private/`
- Serve these files dynamically through a controller that checks `sessionMiddleware` and returns the file stream.
