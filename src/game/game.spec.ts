import { beforeAll, describe, test, expect } from "bun:test";
import { rest } from "@/test/helper";
import { app } from "@/index";
import { getUserByEmail, getUserById } from "@/auth/service";
import { createGame } from "./service";
import { Game } from "@/schema";

const login = rest(app)("/api/auth/login")(null);
const gameReq = (url: string) => rest(app)(url)(null);
const authReq = (token: string) => (url: string) =>
  rest(app)(url)({ Authorization: `Bearer: ${token}` });

let token: string = "";

beforeAll(async () => {
  const res = await login("POST", {
    email: "test@test.com",
    password: "12345",
  });

  const body = await res.json();
  token = body.token;
});

test.each([
  ["POST", "/api/game"],
  ["GET", "/api/game/1"],
])("unauthenticated request respond 401", async (m, url) => {
  const response = await gameReq(url)(m);
  expect(response.status).toBe(401);
});

describe("/api/game", () => {
  let game1: Game;
  let game2: Game;

  beforeAll(async () => {
    const { id } = await getUserByEmail("test@test.com");

    game1 = await createGame({
      owner: id,
    });

    game2 = await createGame({
      owner: id,
    });
  });

  describe("GET /api/game/", () => {
    test("with auth token should give my games", async () => {
      const response = await authReq(token)("/api/game")("GET");
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body).toEqual([game1, game2]);
    });
  });

  describe("GET /api/game/:code", () => {
    const cases = [
      ["123a", 400],
      ["12345a", 400],
      [null, 400],
      [game1.code, 200],
      ["123fg", 404],
    ] as const;

    test.each(cases)("code=%p respond %p", async (code, stat) => {
      const response = await authReq(token)(`/api/game/${code}`)("GET");
      expect(response.status).toBe(stat);
    });
  });
});
