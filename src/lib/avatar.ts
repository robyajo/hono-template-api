import fs from "node:fs";
import path from "node:path";

export async function downloadAndSaveAvatar(userId: string, imageUrl: string): Promise<string | null> {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) return null;

        const contentType = response.headers.get("content-type") || "";
        let extension = "jpg";
        if (contentType.includes("image/png")) extension = "png";
        else if (contentType.includes("image/webp")) extension = "webp";
        else if (contentType.includes("image/gif")) extension = "gif";

        const fileName = `${userId}-${Date.now()}.${extension}`;
        const targetDir = path.resolve("storage/app/public/avatars");
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const targetPath = path.join(targetDir, fileName);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.promises.writeFile(targetPath, buffer);

        // Return path mapped to the public static /storage route
        return `/storage/avatars/${fileName}`;
    } catch (error) {
        console.error("❌ Failed to download avatar:", error);
        return null;
    }
}
