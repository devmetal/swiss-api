import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import getUser from "@/auth/getUser";
import { createGame, getGameByCode, getGamesByUserId } from "./service";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";

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
  zValidator("param", z.object({ code: z.string().length(5) })),
  async (c) => {
    const { code } = c.req.valid("param");
    const result = await getGameByCode(code);

    if (!result) {
      throw new HTTPException(404);
    }

    return c.json(result);
  }
);

const postGameSchema = z.object({
  location: z.string().max(255).optional(),
  label: z.string().max(255).optional(),
  desc: z.string().max(1024).optional(),
});

game.post("/", getUser, zValidator("json", postGameSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await createGame({ ...body, owner: c.get("user").id });
  return c.json(result);
});

export default game;