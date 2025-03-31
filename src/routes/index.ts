import { Router } from "express";
import authRouter from "./authRoute";
import productRouter from "./productRoute";
import customerRouter from "./customerRoute";
import saleRouter from "./saleRoute";
import { middleware } from "../middleware/middleware";

const router = Router();

router.use("/auth", authRouter);
router.use("/products", middleware, productRouter);
router.use("/customers", middleware, customerRouter);
router.use("/sales", middleware, saleRouter);

export default router;
