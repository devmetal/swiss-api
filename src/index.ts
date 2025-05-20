import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";
import auth from "./auth/routes";
import game from "./game/routes";
import { swaggerUI } from "@hono/swagger-ui";

export const app = new OpenAPIHono();

export type AppType = typeof app;

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

app.use(secureHeaders());

if (Bun.env.NODE_ENV !== "test") {
  app.use(logger());
}
app.route("/api/auth", auth);
app.route("/api/game", game);

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

app.get("/swagger", swaggerUI({ url: "/doc" }));

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});

export default {
  port: Number(Bun.env.PORT) ?? 8080,
  fetch: app.fetch,
};
