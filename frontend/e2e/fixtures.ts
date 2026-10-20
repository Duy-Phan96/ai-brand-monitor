import { test as base, expect } from "@playwright/test";
export const test = base.extend<{ networkGuard: void }>({
  networkGuard: [
    async ({ context }, use) => {
      const unexpected: string[] = [];
      await context.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (url.origin === "http://127.0.0.1:5174") await route.continue();
        else {
          unexpected.push(url.origin);
          await route.abort();
        }
      });
      await context.routeWebSocket("**/*", (socket) => {
        if (new URL(socket.url()).origin === "ws://127.0.0.1:5174")
          socket.connectToServer();
        else {
          unexpected.push(new URL(socket.url()).origin);
          socket.close();
        }
      });
      await use();
      expect(unexpected, "Unexpected outbound browser traffic").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
