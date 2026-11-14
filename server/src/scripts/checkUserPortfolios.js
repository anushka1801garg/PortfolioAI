import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }), "users");
  const Portfolio = mongoose.model("Portfolio", new mongoose.Schema({}, { strict: false }), "portfolios");

  // Check test user anushka18garg01@gmail.com
  const testUser = await User.findOne({ email: "anushka18garg01@gmail.com" });
  console.log("Logged in user:", testUser.email, testUser._id);

  let userIds = [testUser._id];
  if (testUser.email && (testUser.email.includes("anushka") || testUser.email.includes("garg"))) {
    const aliasUsers = await User.find({
      $or: [
        { email: /anushka/i },
        { email: /garg/i }
      ]
    }).select("_id email fullName");
    console.log("Alias users found:", aliasUsers.map(u => ({ id: u._id, email: u.email })));
    userIds = Array.from(new Set([...userIds.map(id => id.toString()), ...aliasUsers.map(u => u._id.toString())]))
      .map(id => new mongoose.Types.ObjectId(id));
  }

  const found = await Portfolio.find({ user: { $in: userIds }, isArchived: { $ne: true } }).sort({ updatedAt: -1 });
  console.log("Total portfolios found for Anushka accounts:", found.length);
  found.forEach(p => console.log(" -", p._id.toString(), "|", p.title, "| source:", p.inputSource));

  await mongoose.disconnect();
}

main().catch(console.error);
