import { db } from "../db/db";
import type { Request, Response } from "express";
import { addCustomerValidation } from "../validations/authValidation";
import { tryCatch } from "../constants/tryCatch";

// export const registerUser = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {};

export const addCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const validation = addCustomerValidation.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validation.error.errors,
    });
    return;
  }
  const { name, email, phone, address } = validation.data;
  const { id } = req.user;
  if (!id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { data: customer, error: createCustomerError } = await tryCatch(
    db.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        userId: id,
      },
    })
  );

  if (createCustomerError) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
  res.status(201).json({
    message: "Customer created successfully",
    customer,
  });
};

export const editCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const validation = addCustomerValidation.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validation.error.errors,
    });
    return;
  }
  const { name, email, phone, address } = validation.data;

  const { data: customer, error: editCustomerError } = await tryCatch(
    db.customer.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        phone,
        address,
      },
    })
  );

  if (editCustomerError) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
  res.status(200).json({
    message: "Customer updated successfully",
    customer,
  });
};

export const deleteCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { error: deleteCustomerError } = await tryCatch(
    db.customer.delete({
      where: {
        id,
      },
    })
  );

  if (deleteCustomerError) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
  res.status(200).json({
    message: "Customer deleted successfully",
  });
};

export const getAllCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const totalCustomers = await db.customer.count({
      where: { userId },
    });
    const customers = await db.customer.findMany({
      where: { userId },
      skip: offset,
      take: Number(limit),
    });
    res.status(200).json({
      message: "Customers fetched successfully",
      customers,
      totalCustomers,
      totalPages: Math.ceil(totalCustomers / Number(limit)),
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
