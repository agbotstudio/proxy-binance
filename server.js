const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/__diag") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ ok: true, msg: "Proxy Europeo ARGON activo" }));
  }

  const options = {
    hostname: "fapi.binance.com",
    port: 443,
    path: req.url,
    method: req.method,
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; QuantBot/1.0)"
    }
  };

  if (req.headers["x-mbx-apikey"]) {
    options.headers["X-MBX-APIKEY"] = req.headers["x-mbx-apikey"];
  }
  if (req.headers["content-type"]) {
    options.headers["Content-Type"] = req.headers["content-type"];
  }

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, {
      "Content-Type": proxyRes.headers["content-type"] || "application/json",
      "Cache-Control": "no-store"
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ code: -502, msg: err.message }));
  });

  if (req.method !== "GET" && req.method !== "HEAD") {
    req.pipe(proxyReq, { end: true });
  } else {
    proxyReq.end();
  }
});

server.listen(PORT, () => console.log("Proxy activo en puerto " + PORT));
