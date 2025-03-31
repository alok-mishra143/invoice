import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  editProduct,
} from "../controllers/product.controller";

const productRouter = Router();

productRouter.post("/add", addProduct);
productRouter.patch("/:id", editProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
