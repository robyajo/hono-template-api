import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { writeLog } from "../lib/logger.js";

export const errorHandler = (err: Error, c: Context) => {
    writeLog("ERROR", `${err.name || "Error"}: ${err.message}`, err);

    let status = 500;
    let message = err.message || "An unexpected error occurred";
    let errorName = err.name || "InternalServerError";

    if (err instanceof HTTPException) {
        status = err.status;
        message = err.message;
        errorName = err.name === "Error" ? "HTTPException" : err.name;
    } else if (c.res.status !== 200 && c.res.status) {
        status = c.res.status;
    }

    return c.json(
        {
            error: errorName,
            message,
            status,
        },
        status as any
    );
};
