import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { ApiFeatures } from "../utils/apiFeatures.js";

const deleteOne = (Model) => {
  return catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc)
      throw new AppError(
        `${Model.inspect()
          .match(/{(.*?)}/)[1]
          .trim()} not found!`,
        404
      );
    res.status(204).json({ msg: "doc deleted" });
  });
};

const updateOne = (Model) => {
  return catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      throw new AppError(
        `${Model.inspect()
          .match(/{(.*?)}/)[1]
          .trim()} not found!`,
        404
      );
    res.status(200).json({ doc });
  });
};

const createOne = (Model) => {
  return catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: "success", data: doc });
  });
};

const getOne = (Model) => {
  return catchAsync(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc)
      throw new AppError(
        `${Model.inspect()
          .match(/{(.*?)}/)[1]
          .trim()} not found!`,
        404
      );
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

const getAll = (Model) => {
  return catchAsync(async (req, res) => {
    //For a review, getall should get all reviews for a tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const queryBuilder = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .paginate()
      .fields();
    const doc = await queryBuilder.query.exec();
    res.status(200).json({ status: "success", data: doc });
  });
};

export { deleteOne, updateOne, createOne, getOne, getAll };
