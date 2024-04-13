import { Schema, model } from "mongoose";

const reviewSchema = new Schema({
  review: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tour: {
    type: Schema.ObjectId,
    ref: "Tour",
    required: [true, "Review must belong to a tour"],
  },
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: [true, "User who reviewed required"],
  },
});

reviewSchema.query.getUser = function () {
  return this.populate({ path: "user", select: "name photo" });
};

reviewSchema.query.getTour = function () {
  return this.populate({ path: "tour", select: "name" });
};

const Review = model("Review", reviewSchema);

export { Review };
