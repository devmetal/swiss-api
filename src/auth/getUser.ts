import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { getUserById } from "./service";
import { User } from "@/schema";
import { verify } from "hono/jwt";

const secret = Bun.env.SECRET;

export default createMiddleware<{ Variables: { user: User } }>(
  async (c, next) => {
    if (c.get("user")) {
      return next();
    }

    const auth = c.req.header("Authorization");

    const token = auth?.split(" ")[1];

    if (!token) {
      throw new HTTPException(401);
    }

    const { sub } = (await verify(token, secret)) as { sub: number };

    if (!sub || !Number.isInteger(sub)) {
      throw new HTTPException(401);
    }

    const user = await getUserById(sub);
    c.set("user", user);
    return next();
  }
);
