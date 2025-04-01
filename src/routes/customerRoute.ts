import { Router } from "express";
import {
  addCustomer,
  deleteCustomer,
  editCustomer,
  getAllCustomer,
} from "../controllers/customer.controller";

const customerRouter = Router();

customerRouter.post("/add", addCustomer);
customerRouter.patch("/:id", editCustomer);
customerRouter.delete("/:id", deleteCustomer);
customerRouter.get("/", getAllCustomer);

export default customerRouter;
