import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
  try {
    const result = await cloudinary.uploader.upload(
      "./public/uploads/1784706309115-315197696.pdf",
      {
        resource_type: "raw",
      },
    );

    console.log(result);
  } catch (err) {
    console.dir(err, { depth: null });
  }
}

test();
