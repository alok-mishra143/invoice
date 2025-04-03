import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
} from "../controllers/product.controller";

const productRouter = Router();

productRouter.post("/", addProduct);
productRouter.patch("/:id", editProduct);
productRouter.delete("/:id", deleteProduct);
productRouter.get("/", getAllProducts);

export default productRouter;
