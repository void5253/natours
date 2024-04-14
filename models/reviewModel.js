import { Schema, model } from "mongoose";
import { Tour } from "./tourModel.js";

const reviewSchema = new Schema(
  {
    review: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
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
  },
  { id: false }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Adjusting rating every time a review is done (created, updated or deleted)
const changeAvgRating = async (tourId, rating, mult) => {
  const original = await Tour.findById(tourId);
  let { ratingsAverage, ratingsQuantity } = original;
  ratingsAverage =
    (ratingsAverage * ratingsQuantity + mult * rating) /
    (ratingsQuantity + mult * 1);
  ratingsQuantity = ratingsQuantity + mult * 1;
  console.log({ ratingsAverage, ratingsQuantity });
  await Tour.findByIdAndUpdate(
    tourId,
    { ratingsAverage, ratingsQuantity },
    { new: true, runValidators: true }
  );
};

reviewSchema.pre("findOneAndUpdate", async function (next) {
  const { rating: origRating, tour } = await this.model.findOne(
    this.getFilter()
  );
  const { rating: newRating } = this.getUpdate();
  await changeAvgRating(tour, origRating, -1);
  await changeAvgRating(tour, newRating, 1);
  next();
});

reviewSchema.pre("findOneAndDelete", async function (next) {
  const { rating: origRating, tour } = await this.model.findOne(
    this.getFilter()
  );
  await changeAvgRating(tour, origRating, -1);
  next();
});

reviewSchema.pre("save", async function (next) {
  //This is done to check if user has already created a review for the tour
  //Indexing prevents insert into db, but it doesn't prevent rating updation.
  const exists = await this.constructor.findOne({
    tour: this.tour,
    user: this.user,
  });
  if (exists) return next();
  await changeAvgRating(this.tour, this.rating, 1);
  next();
});
// End of rating update

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" });
  next();
});

const Review = model("Review", reviewSchema);

export { Review };
