import { Tour } from "../models/tourModel.js";
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from "./handlerFactory.js";

const getAllTours = getAll(Tour);
const getTour = getOne(Tour);
const updateTour = updateOne(Tour);
const createTour = createOne(Tour);
const deleteTour = deleteOne(Tour);

export { getAllTours, getTour, createTour, updateTour, deleteTour };
