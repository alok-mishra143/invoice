import { Router } from "express";
import authRouter from "./authRoute";
import productRouter from "./productRoute";
import customerRouter from "./customerRoute";
import { middleware } from "../middleware/middleware";

const router = Router();

router.use("/auth", authRouter);
router.use("/products", middleware, productRouter);
router.use("/customers", middleware, customerRouter);

export default router;
