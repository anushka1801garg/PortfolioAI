import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { default: Portfolio } = await import("../src/models/portfolio.model.js");
  const p = await Portfolio.findById("6ab53393403ae370d9af6618");
  
  const distHtml = fs.readFileSync("../client/dist/index.html", "utf-8");
  const cleanData = JSON.stringify(p.toObject());
  const injected = distHtml.replace(
    "<head>",
    `<head>\n    <script>window.__PORTFOLIO_DATA__ = ${cleanData};</script>`
  );
  
  fs.writeFileSync("../client/dist/test.html", injected, "utf-8");
  console.log("Successfully created test.html! Length:", injected.length);
  await mongoose.disconnect();
}

main().catch(console.error);
