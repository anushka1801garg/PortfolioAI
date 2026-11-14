import "dotenv/config";
import cloudinary from "./utils/cloudinary.js";

async function test() {
  try {
    const result = await cloudinary.api.ping();
    console.log(result);
  } catch (err) {
    console.log(err);
  }
}

test();
