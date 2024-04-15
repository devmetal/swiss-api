import { beforeAll, beforeEach, describe, test, expect } from "bun:test";
import { rest } from "@/test/helper";
import { app } from "@/index";
import { getUserByEmail, getUserById } from "@/auth/service";
import { createGame } from "./service";
import { Game, games } from "@/schema";
import { db } from "@/database";

const login = rest(app)("/api/auth/login")(null);

const req = (url: string) => rest(app)(url)(null);

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
  const response = await req(url)(m);
  expect(response.status).toBe(401);
});

describe("/api/game", () => {
  describe("GET /api/game/", () => {
    let game1: Game;
    let game2: Game;

    beforeEach(async () => {
      await db.delete(games).all();

      const { id } = await getUserByEmail("test@test.com");

      game1 = await createGame({
        owner: id,
      });

      game2 = await createGame({
        owner: id,
      });
    });

    test("with auth token should give my games", async () => {
      const response = await authReq(token)("/api/game")("GET");
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body).toEqual([game1, game2]);
    });

    test("with valid code should give back the game", async () => {
      const response = await authReq(token)(`/api/game/${game1.code}`)("GET");
      const body = await response.json();
      expect(body).toEqual(game1);
    });
    describe("GET /api/game/:code", () => {});
  });

  describe("GET /api/game/:code", () => {
    const cases = [
      ["123a", 400],
      ["12345a", 400],
      [null, 400],
      ["123fg", 404],
    ] as const;

    test.each(cases)("code=%p respond %p", async (code, stat) => {
      const response = await authReq(token)(`/api/game/${code}`)("GET");
      expect(response.status).toBe(stat);
    });
  });

  describe("POST /api/game/", () => {
    const cases = [
      [{}, 200],
      [{ location: "Budapest", label: "MTG Night", desc: "foo" }, 200],
      [{ location: 1, label: "t", desc: "t" }, 400],
      [{ location: "t", label: 1, desc: "t" }, 400],
      [{ location: "t", label: "t", desc: 1 }, 400],
    ] as const;

    test.each(cases)("body=%p respond %p", async (body, stat) => {
      const response = await authReq(token)(`/api/game`)("POST", body);
      expect(response.status).toBe(stat);
    });
  });
});
