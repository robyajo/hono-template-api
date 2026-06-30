import fs from "node:fs";
import path from "node:path";

const logDir = path.resolve("storage", "log");
const logFile = path.join(logDir, "log.log");

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

function getFormattedTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function writeLog(level: "INFO" | "ERROR" | "WARN", message: string, error?: Error) {
    const timestamp = getFormattedTimestamp();
    const envName = process.env.NODE_ENV || "local";
    const logPrefix = `[${timestamp}] ${envName}.${level}`;

    let fileLogMessage = `${logPrefix}: ${message}`;

    if (level === "ERROR" && error) {
        const firstStackLine = error.stack?.split("\n")[1]?.trim() || "";
        fileLogMessage += ` {"exception":"[object] (${error.name}(code: 0): ${error.message} at ${firstStackLine})"}\n`;
        if (error.stack) {
            fileLogMessage += `[stacktrace]\n${error.stack}\n`;
        }
    } else {
        fileLogMessage += `\n`;
    }

    // Print to console
    if (level === "ERROR") {
        console.error(`[${level}] ${message}`, error || "");
    } else if (level === "WARN") {
        console.warn(`[${level}] ${message}`);
    } else {
        console.log(message);
    }

    // Append to file asynchronously
    fs.appendFile(logFile, fileLogMessage, (err) => {
        if (err) {
            console.error("❌ Failed to write to log file:", err);
        }
    });
}
