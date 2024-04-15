import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import getUser from "@/auth/getUser";
import {
  createGame,
  getGameByCode,
  getGameByIdAndUserId,
  getGamesByUserId,
  updateGame,
} from "./service";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";

const postGameSchema = z.object({
  location: z.string().max(255).optional(),
  label: z.string().max(255).optional(),
  desc: z.string().max(1024).optional(),
});

const patchGameSchema = z.object({
  location: z.string().max(255).optional(),
  label: z.string().max(255).optional(),
  desc: z.string().max(1024).optional(),
  open: z.boolean().optional(),
  closed: z.boolean().optional(),
});

const idParamsSchema = z.object({
  id: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v)),
});

const game = new Hono();

game.use(jwt({ secret: Bun.env.SECRET }));
game.use(getUser);

game.get("/", getUser, async (c) => {
  const games = await getGamesByUserId(c.get("user").id);
  return c.json(games);
});

game.get(
  "/mine/:id",
  getUser,
  zValidator("param", idParamsSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await getGameByIdAndUserId(id, c.get("user").id);

    if (!result) {
      throw new HTTPException(404);
    }

    return c.json(result);
  }
);

game.get(
  "/:code",
  getUser,
  zValidator("param", z.object({ code: z.string().min(5).max(5) })),
  async (c) => {
    const { code } = c.req.valid("param");
    const result = await getGameByCode(code);

    if (!result) {
      throw new HTTPException(404);
    }

    return c.json(result);
  }
);

game.post("/", getUser, zValidator("json", postGameSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await createGame({ ...body, owner: c.get("user").id });
  return c.json(result);
});

game.patch(
  "/:id",
  getUser,
  zValidator("param", idParamsSchema),
  zValidator("json", patchGameSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    if (!Object.keys(body).length) {
      throw new HTTPException(400);
    }

    const result = await updateGame(c.get("user").id, id, body);

    if (!result) {
      throw new HTTPException(404);
    }

    return c.json(result);
  }
);

export default game;
