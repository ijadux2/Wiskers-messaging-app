import { serve } from "bun";

const PORT = process.env.PORT || 3000;

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;

    if (filePath === "/") {
      filePath = "/index.html";
    }

    try {
      const file = Bun.file(`.${filePath}`);
      if (await file.exists()) {
        return new Response(file);
      }
    } catch (e) {
      // File not found
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Whisker Chat running at http://localhost:${PORT}`);
