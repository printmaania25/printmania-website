import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
}, {
  timestamps: true
});

export default mongoose.model("User", userSchema);
