import { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { checkEmailAndPassword, createUser, isUserAlready } from "./service";
import getUser from "./getUser";

const auth = new OpenAPIHono();

const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

const UserSchema = z.object({
  email: z.string().email(),
  id: z.number(),
});

const TokenSchema = z.object({
  token: z.string(),
});

const register = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "User created",
    },
  },
});

const login = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TokenSchema,
        },
      },
      description: "Auth token created",
    },
  },
});

const me = createRoute({
  method: "get",
  path: "/me",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Current user",
    },
  },
  security: [
    {
      Bearer: [],
    },
  ],
  middleware: [getUser] as const,
});

auth.openapi(register, async (c) => {
  const { email, password } = c.req.valid("json");

  if (await isUserAlready(email)) {
    throw new HTTPException(400);
  }

  const user = await createUser(email, password);
  return c.json({ email: user.email, id: user.id });
});

auth.openapi(login, async (c) => {
  const { email, password } = c.req.valid("json");
  const user = await checkEmailAndPassword(email, password);

  if (!user) {
    throw new HTTPException(401);
  }

  const payload = {
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 5,
  };

  const token = await sign(payload, Bun.env.SECRET);
  return c.json({ token });
});

auth.openapi(me, function (c) {
  const user = c.get("user");
  return c.json({ email: user.email, id: user.id });
});

export default auth;
