import http from "http";

const PORT = 4001;
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, url: req.url, time: new Date().toISOString() }));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`tiny server on http://127.0.0.1:${PORT}`);
});
