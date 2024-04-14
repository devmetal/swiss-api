import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { getUserById } from "./service";
import { User } from "@/schema";

export default createMiddleware<{ Variables: { user: User } }>(
  async (c, next) => {
    if (c.get("user")) {
      return next();
    }

    const { sub } = c.get("jwtPayload") as { sub: number };

    if (!sub || !Number.isInteger(sub)) {
      throw new HTTPException(401);
    }

    const user = await getUserById(sub);
    c.set("user", user);
    return next();
  }
);
