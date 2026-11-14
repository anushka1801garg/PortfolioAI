import fs from "fs";
import path from "path";
import stream from "stream";
import * as archiverPkg from "archiver";

async function testZip() {
  const distPath = path.resolve("../client/dist");
  const archive = new archiverPkg.ZipArchive({ zlib: { level: 6 } });
  const bufs = [];
  const pt = new stream.PassThrough();
  
  pt.on("data", (c) => bufs.push(c));
  
  const finishPromise = new Promise((resolve, reject) => {
    pt.on("end", () => {
      const total = Buffer.concat(bufs);
      console.log("Zip successfully created! Total size:", (total.length / 1024 / 1024).toFixed(2), "MB");
      resolve(total);
    });
    pt.on("error", reject);
  });

  archive.pipe(pt);

  archive.append("/* /index.html 200\n", { name: "_redirects" });
  archive.append("", { name: ".nojekyll" });

  const distEntries = fs.readdirSync(distPath);
  for (const entry of distEntries) {
    if (entry === "index.html" || entry === "test.html") continue;
    const fullPath = path.join(distPath, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      archive.directory(fullPath, entry);
    } else {
      archive.file(fullPath, { name: entry });
    }
  }

  archive.append(
    `<!doctype html><html><head><script>window.__PORTFOLIO_DATA__ = { test: true };</script></head><body><div id="root"></div></body></html>`,
    { name: "index.html" }
  );

  archive.finalize();
  await finishPromise;
}

testZip().catch(console.error);
