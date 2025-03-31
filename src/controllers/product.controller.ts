import { db } from "../db/db";
import type { Request, Response } from "express";
import { addProductValidation } from "../validations/authValidation";
import { tryCatch } from "../constants/tryCatch";

// export const registerUser = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {};

export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Add product controller called");
  const validation = addProductValidation.safeParse(req.body);
  const { id } = req.user;
  if (!id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (!validation.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validation.error.errors,
    });
    return;
  }

  const { name, price, stock, image, description } = validation.data;

  const { data: product, error: createProductError } = await tryCatch(
    db.product.create({
      data: {
        name,
        price,
        stock,
        image,
        description,
        userId: id,
      },
    })
  );

  if (createProductError) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  res.status(201).json({
    message: "Product created successfully",
    product,
  });
};

export const editProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const validations = addProductValidation.safeParse(req.body);
  if (!validations.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validations.error.errors,
    });
    return;
  }
  const { name, price, stock, image, description } = validations.data;
  const { data: product, error: updateProductError } = await tryCatch(
    db.product.update({
      where: { id },
      data: {
        name,
        price,
        stock,
        image,
        description,
      },
    })
  );
  if (updateProductError) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
  res.status(200).json({
    message: "Product updated successfully",
    product,
  });
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { data: product, error: deleteProductError } = await tryCatch(
    db.product.delete({
      where: { id },
    })
  );

  if (deleteProductError) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  res.status(200).json({
    message: "Product deleted successfully",
    product,
  });
};
