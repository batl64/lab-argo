const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createServer } = require("../server");

let server;
let port;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: "127.0.0.1", port, method, path },
      (res) => {
        let data = "";
        res.on("data", (c) => {
          data += c;
        });
        res.on("end", () =>
          resolve({ status: res.statusCode, headers: res.headers, body: data }),
        );
      },
    );
    req.on("error", reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

const calc = (expression) =>
  request("POST", "/api/calc", JSON.stringify({ expression }));

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  port = server.address().port;
});

after(() => new Promise((resolve) => server.close(resolve)));

describe("POST /api/calc", () => {
  test("повертає результат", async () => {
    const res = await calc("2+2*2");
    assert.equal(res.status, 200);
    assert.match(res.headers["content-type"], /application\/json/);
    assert.deepEqual(JSON.parse(res.body), { result: 6 });
  });

  test("помилка обчислення → 400", async () => {
    const res = await calc("1/0");
    assert.equal(res.status, 400);
    assert.deepEqual(JSON.parse(res.body), { error: "Ділення на нуль" });
  });

  test("некоректний JSON → 400", async () => {
    const res = await request("POST", "/api/calc", "{не json");
    assert.equal(res.status, 400);
    assert.deepEqual(JSON.parse(res.body), { error: "Некоректний запит" });
  });

  test("відсутнє поле expression → 400", async () => {
    const res = await request("POST", "/api/calc", "{}");
    assert.equal(res.status, 400);
  });
});

describe("статичні файли", () => {
  test("GET / віддає index.html", async () => {
    const res = await request("GET", "/");
    assert.equal(res.status, 200);
    assert.match(res.headers["content-type"], /text\/html/);
    assert.match(res.body, /<title>Калькулятор<\/title>/);
  });

  test("index.html містить скрипт калькулятора (без зовнішніх файлів)", async () => {
    const res = await request("GET", "/");
    assert.match(res.body, /<script>[\s\S]*fetch\(["']\/api\/calc["']/);
    assert.doesNotMatch(res.body, /<script[^>]+src=/);
  });

  test("неіснуючий файл → 404", async () => {
    const res = await request("GET", "/nope.html");
    assert.equal(res.status, 404);
  });

  test("вихід за межі public/ заборонено", async () => {
    const res = await request("GET", "/../package.json");
    assert.equal(res.status, 403);
  });

  test("server.js не віддається", async () => {
    const res = await request("GET", "/server.js");
    assert.ok([403, 404].includes(res.status));
  });
});

test("непідтримуваний метод → 405", async () => {
  const res = await request("PUT", "/");
  assert.equal(res.status, 405);
});
