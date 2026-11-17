/* eslint-disable @typescript-eslint/no-require-imports -- Plesk/Passenger CommonJS başlangıç dosyası */
/*
 * Plesk (Phusion Passenger) gibi bir başlangıç dosyası isteyen sunucular için.
 * Plesk > Node.js > "Application Startup File": server.js
 *
 * Önce `npm install` ve `npm run build` çalıştırılmış olmalı.
 * Yerelde normal geliştirme için `npm run dev` kullanılır; bu dosya gerekmez.
 */
const { createServer } = require("node:http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Danacı Ayakkabı ${port} portunda çalışıyor`);
  });
});
