import "./env.js";
import { app } from "./app.js";
import process from "node:process";
import mongoose from "mongoose";

try {
  await mongoose.connect(
    process.env.MONGO_URI.replace("<password>", process.env.MONGO_PASSWORD)
  );
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}...`);
  });
} catch (e) {
  console.log(e);
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("SIGINT received...");
  process.exit(0);
});
