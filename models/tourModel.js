import { Schema, model } from "mongoose";

const locationSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
  day: Number,
  address: String,
  description: {
    type: String,
    required: true,
  },
});

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
      min: [0, "Price should be > 0"],
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
      min: [0, "Duration should be > 0"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a max group size"],
      min: [0, "maxGroupSize should be > 0"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Easy, medium or difficult tours",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [0, "Rating must be above 0"],
      max: [5, "Rating must be below 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, "ratingsQuantity should be > 0"],
    },
    priceDiscount: {
      type: Number,
      default: 0,
      validate: {
        validator(val) {
          return val <= this.price;
        },
        message: `Discount ({VALUE}) > price`,
      },
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have an image cover"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      type: locationSchema,
      required: true,
    },
    locations: {
      type: [locationSchema],
      required: true,
    },
    guides: [
      {
        type: Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

tourSchema.query.getGuides = function () {
  return this.populate({
    path: "guides",
    select: "-passwordChangedAt",
  });
};

tourSchema.query.getReviews = function (n) {
  return this.populate({
    path: "reviews",
    select: "-__v",
    limit: n,
  });
};

const Tour = model("Tour", tourSchema);
export { Tour };
