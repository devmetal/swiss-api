import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";
import auth from "./auth/routes";
import game from "./game/routes";
import { withYoga } from "./yoga";

export const app = new Hono();

export type AppType = typeof app;

app.use(secureHeaders());

if (Bun.env.NODE_ENV !== "test") {
  app.use(logger());
}

app.route("/api/auth", auth);
app.route("/api/game", game);
app.use("/graphql", withYoga);

app.onError((err, c) => {
  if (Bun.env.NODE_ENV !== "test") {
    console.error(err.message);
    console.error(err.stack);
  }

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.text("Internal Server Error", 500);
});

export default {
  port: Number(Bun.env.PORT) ?? 8080,
  fetch: app.fetch,
};
