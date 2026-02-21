import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const HTML = await readFile(join(__dirname, "index.html"), "utf-8");
const CSS = await readFile(join(__dirname, "public", "styles.css"), "utf-8");
const JS = await readFile(join(__dirname, "src", "app.js"), "utf-8");

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/styles.css") {
      return new Response(CSS, {
        headers: { "Content-Type": "text/css" },
      });
    }

    if (url.pathname === "/app.js") {
      return new Response(JS, {
        headers: { "Content-Type": "application/javascript" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
