import { createSchema, createYoga } from "graphql-yoga";
import { createMiddleware } from "hono/factory";

const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String
      }
    `,
    resolvers: {
      Query: {
        greetings: () => "Hello from Yoga in a Bun app!",
      },
    },
  }),
});

export const withYoga = createMiddleware(async (c, next) => {
  const response = await yoga.fetch(
    c.req.url,
    {
      method: c.req.method,
      headers: c.req.header(),
      body: c.req.raw.body,
    },
    c
  );

  const headersObj = Object.fromEntries(response.headers.entries());

  return c.body(response.body, {
    status: response.status,
    headers: headersObj,
  });
});

export default yoga;
