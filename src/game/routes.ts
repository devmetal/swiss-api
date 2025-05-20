import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
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

const GameSchema = z.object({
  code: z.string(),
  id: z.number(),
  started: z.string(),
  location: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  desc: z.string().nullable().optional(),
  open: z.boolean().nullable().optional(),
  closed: z.boolean().nullable().optional(),
  owner: z.number(),
});

const PostGameSchema = z.object({
  location: z.string().max(255).optional(),
  label: z.string().max(255).optional(),
  desc: z.string().max(1024).optional(),
});

const PatchGameSchema = z.object({
  location: z.string().max(255).optional(),
  label: z.string().max(255).optional(),
  desc: z.string().max(1024).optional(),
  open: z.boolean().optional(),
  closed: z.boolean().optional(),
});

const IdParamsSchema = z.object({
  id: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v)),
});

const getGamesRoute = createRoute({
  method: "get",
  path: "/",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(GameSchema),
        },
      },
      description: "List of current user games",
    },
  },
  security: [
    {
      Bearer: [],
    },
  ],
  middleware: [getUser] as const,
});

const getGameRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GameSchema,
        },
      },
      description: "Game of the current user",
    },
  },
  security: [
    {
      Bearer: [],
    },
  ],
  middleware: [getUser] as const,
});

const getGameByCodeRoute = createRoute({
  method: "get",
  path: "/code/{code}",
  request: {
    params: z.object({ code: z.string().min(5).max(5) }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GameSchema,
        },
      },
      description: "A game by code",
    },
  },
  security: [
    {
      Bearer: [],
    },
  ],
  middleware: [getUser] as const,
});

const createGameRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PostGameSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GameSchema,
        },
      },
      description: "Game created",
    },
  },
  security: [
    {
      Bearer: [],
    },
  ],
  middleware: [getUser] as const,
});

const patchGameRoute = createRoute({
  method: "patch",
  path: "/{id}",
  request: {
    params: IdParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: PatchGameSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: GameSchema,
        },
      },
      description: "Game updated",
    },
  },
  security: [
    {
      Bearer: [],
    },
  ],
  middleware: [getUser] as const,
});

const gameRouter = new OpenAPIHono();

gameRouter
  .openapi(getGamesRoute, async (c) => {
    const games = await getGamesByUserId(c.get("user").id);
    return c.json(games);
  })
  .openapi(getGameRoute, async (c) => {
    const { id } = c.req.valid("param");
    const result = await getGameByIdAndUserId(id, c.get("user").id);

    if (!result) {
      throw new HTTPException(404);
    }

    return c.json(result);
  })
  .openapi(getGameByCodeRoute, async (c) => {
    const { code } = c.req.valid("param");
    const result = await getGameByCode(code);

    if (!result) {
      throw new HTTPException(404);
    }

    return c.json(result);
  })
  .openapi(createGameRoute, async (c) => {
    const body = c.req.valid("json");
    const result = await createGame({ ...body, owner: c.get("user").id });
    return c.json(result);
  })
  .openapi(patchGameRoute, async (c) => {
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
  });

export default gameRouter;
