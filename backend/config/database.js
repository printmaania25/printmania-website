import mongoose from "mongoose";

export const database = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to the database");
  } catch (err) {
    console.log("Database connection error:", err.message);
  }
};
