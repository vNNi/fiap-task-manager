import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: [true, "* Required Field!"] },
  email: { type: String, required: [true, "* Required Field!"] },
  password: { type: String, required: [true, "* Required Field!"] },
});

export const UserModel =
  mongoose.models.users || mongoose.model("users", UserSchema);
