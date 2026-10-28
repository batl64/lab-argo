// Веб-калькулятор: Node.js без зовнішніх залежностей.
// Запуск: node server.js  →  http://localhost:3000
const http = require("http");
const fs = require("fs");
const path = require("path");
const { evaluate } = require("./calc");

const PORT = process.env.PORT || 3000;
// Якщо папки public/ немає (файли лежать в одній теці), беремо поточну теку
const PUBLIC = fs.existsSync(path.join(__dirname, "public", "index.html"))
  ? path.join(__dirname, "public")
  : __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
};

function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handler(req, res) {
  if (req.method === "POST" && req.url === "/api/calc") {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 2048) req.destroy();
    });
    req.on("end", () => {
      try {
        const { expression } = JSON.parse(body);
        sendJSON(res, 200, { result: evaluate(expression) });
      } catch (e) {
        sendJSON(res, 400, {
          error: e instanceof SyntaxError ? "Некоректний запит" : e.message,
        });
      }
    });
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405);
    return res.end();
  }

  const urlPath = req.url.split("?")[0];
  const file = path.normalize(
    path.join(PUBLIC, urlPath === "/" ? "index.html" : urlPath),
  );
  if (!file.startsWith(PUBLIC + path.sep) || file === __filename) {
    res.writeHead(403);
    return res.end();
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Не знайдено");
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
    });
    res.end(data);
  });
}

function createServer() {
  return http.createServer(handler);
}

if (require.main === module) {
  createServer().listen(PORT, () =>
    console.log(`Калькулятор: http://localhost:${PORT}`),
  );
}

module.exports = { createServer };
