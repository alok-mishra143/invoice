import { Router } from "express";
import { addSale, deleteSale, editSale } from "../controllers/sale.controller";

const saleRouter = Router();

saleRouter.post("/add", addSale);
saleRouter.put("/:saleId", editSale);
saleRouter.delete("/:saleId", deleteSale);

export default saleRouter;
