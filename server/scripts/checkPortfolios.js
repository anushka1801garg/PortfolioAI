import "dotenv/config";
import connectDB from "../src/database/db.js";
import Portfolio from "../src/models/portfolio.model.js";

async function main() {
  await connectDB();
  const list = await Portfolio.find({}, "title name status isPublic deployedUrl createdAt").lean();
  console.log("TOTAL PORTFOLIOS:", list.length);
  console.log(JSON.stringify(list, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
