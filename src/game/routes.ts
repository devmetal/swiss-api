import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import getUser from "@/auth/getUser";
import { createGame, getGameByCode, getGamesByUserId } from "./service";
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

const game = new Hono();

game.use(jwt({ secret: Bun.env.SECRET }));
game.use(getUser);

game.get("/", getUser, async (c) => {
  const games = await getGamesByUserId(c.get("user").id);
  return c.json(games);
});

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
  zValidator(
    "param",
    z.object({
      id: z
        .string()
        .transform((v) => Number(v))
        .refine((v) => Number.isInteger(v)),
    })
  ),
  zValidator("json", patchGameSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
  }
);

export default game;
