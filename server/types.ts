declare module "bun" {
  interface Env {
    PORT: string;
    SECRET: string;
    DB: string;
  }
}
