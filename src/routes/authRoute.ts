import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/signup", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);

export default authRouter;
