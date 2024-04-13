import { Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide valid email!"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password should contain at least 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm password!"],
    minlength: [8, "Password should contain at least 8 characters"],
    validate: {
      // This only works on CREATE and SAVE
      validator: function (pc) {
        return pc === this.password;
      },
      message: "Password couldn't be confirmed!",
    },
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ["user", "guide", "admin"],
    default: "user",
  },
  passwordResetToken: String,
  passwordResetTokenExpiresIn: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 15);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.verifyPassword = async function (
  submittedPassword,
  password
) {
  return await bcrypt.compare(submittedPassword, password);
};

userSchema.methods.passwordHasChanged = function (jwtTimestamp) {
  return jwtTimestamp < Date.parse(this.passwordChangedAt) / 1000;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpiresIn = Date.now() + 10 * 1000 * 60;
  //console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

userSchema.query.byActive = function () {
  return this.where({ active: { $ne: false } });
};

const User = model("User", userSchema);

export { User };
