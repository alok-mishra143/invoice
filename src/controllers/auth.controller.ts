import type { Request, Response } from "express";
import { db } from "../db/db";
import {
  loginValidation,
  registerValidation,
} from "../validations/authValidation";
import { tryCatch } from "../constants/tryCatch";
import jwt from "jsonwebtoken";
import { responseMessages } from "../constants/responceMeassage";
const { authError } = responseMessages;

// export const registerUser = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const validations = registerValidation.safeParse(req.body);

  if (!validations.success) {
    res.status(400).json({
      message: authError.validationFailed,
      errors: validations.error.errors,
    });
    return;
  }

  const { name, email, password } = validations.data;

  const { data: existingUser, error: findUserError } = await tryCatch(
    db.user.findUnique({
      where: { email },
    })
  );

  if (findUserError) {
    res.status(500).json({ message: authError.userNotFound });
    return;
  }

  if (existingUser) {
    res.status(400).json({ message: authError.userAlreadyExists });
    return;
  }

  const newpass = await Bun.password.hash(password);

  const { data: user, error: createUserError } = await tryCatch(
    db.user.create({
      data: {
        name,
        email,
        password: newpass,
      },
    })
  );

  if (createUserError) {
    res.status(500).json({ message: authError.errorCreatingUser });
    return;
  }

  res.status(201).json({ message: authError.userRegisteredSuccessfully, user });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const validations = loginValidation.safeParse(req.body);

  if (!validations.success) {
    res.status(400).json({
      message: authError.validationFailed,
      errors: validations.error.errors,
    });
    return;
  }

  const { email, password } = validations.data;

  const { data: user, error: findUserError } = await tryCatch(
    db.user.findUnique({
      where: { email },
    })
  );

  if (findUserError) {
    res.status(500).json({ message: authError.errorFindingUser });
    return;
  }

  if (!user) {
    res.status(401).json({ message: authError.userNotFound });
    return;
  }

  const isPasswordValid = await Bun.password.verify(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: authError.invalidPassword });
    return;
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86_400_000,
  });

  res.status(200).json({ message: authError.userLoginSuccess, token: token });
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.clearCookie("token");
  res.status(200).json({ message: authError.userLogoutSuccess });
};
