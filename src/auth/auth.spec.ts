import { test, expect, beforeAll, describe } from "bun:test";
import { app } from "@/index";
import { rest } from "@/test/helper";

const register = rest(app)("/api/auth/register")(null);
const login = rest(app)("/api/auth/login")(null);
const me = rest(app)("/api/auth/me");

describe("POST /api/auth/register", () => {
  const cases = [
    ["email", "test1@test.com", "password", "12345", 200],
    ["email", "test@test.com", "password", "12345", 400],
    ["e", "", "p", "", 400],
    ["email", "", "p", "", 400],
    ["email", null, "p", null, 400],
    ["email", "invalid", "password", "12345", 400],
    ["email", "valid@valid.com", "password", "12", 400],
  ] as const;

  test.each(cases)("%p=%p, %p=%p respond %p", async (e, ev, p, pv, s) => {
    const response = await register("POST", {
      [e]: ev,
      [p]: pv,
    });

    expect(response.status).toBe(s);
  });
});

describe("POST /api/auth/login", () => {
  const cases = [
    ["email", "test@test.com", "password", "12345", 200],
    ["email", "test@test.com", "password", "1234", 401],
    ["email", "nuser@test.com", "password", "12345", 401],
    ["e", "", "p", "", 400],
    ["email", "", "p", "", 400],
    ["email", null, "p", null, 400],
    ["email", "invalid", "password", "12345", 400],
    ["email", "valid@valid.com", "password", "12", 400],
  ] as const;

  test.each(cases)("%p=%p, %p=%p respond with %p", async (e, ev, p, pv, s) => {
    const response = await login("POST", { [e]: ev, [p]: pv });
    expect(response.status).toBe(s);
  });
});

describe("GET /api/auth/me", () => {
  let token: () => string = () => "";

  beforeAll(async () => {
    const response = await login("POST", {
      email: "test@test.com",
      password: "12345",
    });

    const body = await response.json();
    token = () => body.token;
  });

  const cases = [
    ["Auth", token, 401],
    [null, null, 401],
    ["Authorization", token, 401],
    ["Authorization", () => `Bearer: ${token()}`, 200],
  ] as const;

  test.each(cases)("Header %p: %p respond %p", async (h, v, s) => {
    const headers = h ? { [h]: v?.() ?? null } : null;
    const response = await me(headers)("GET");
    expect(response.status).toBe(s);
  });
});
