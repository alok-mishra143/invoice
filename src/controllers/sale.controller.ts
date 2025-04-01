import type { Request, Response } from "express";
import { db } from "../db/db";
import { z } from "zod";

const saleSchema = z.object({
  customerId: z.string(),
  products: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});

export const addSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = saleSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Invalid data",
        errors: validation.error.errors,
      });
      return;
    }

    const { customerId, products } = validation.data;
    const { id: userId } = req.user;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const productData = await db.product.findMany({
      where: { id: { in: products.map((p) => p.productId) } },
    });

    let total = 0;
    const saleItems: any = [];

    for (const { productId, quantity } of products) {
      const product = productData.find((p) => p.id === productId);

      if (!product) {
        res.status(400).json({ message: `Product ${productId} not found` });
        return;
      }

      if (product.stock < quantity) {
        res.status(400).json({
          message: `Not enough stock for product ${product.name}`,
        });
        return;
      }

      total += product.price * quantity;
      saleItems.push({
        productId,
        quantity,
        priceAtSale: product.price,
      });
    }

    const sale = await db.$transaction(async (prisma) => {
      const newSale = await prisma.sale.create({
        data: {
          customerId,
          userId,
          total,
          items: {
            create: saleItems,
          },
        },
        include: { items: true },
      });

      for (const { productId, quantity } of products) {
        await prisma.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });
      }

      return newSale;
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error("Error adding sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;
    const { id: userId } = req.user;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const validation = saleSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Invalid data",
        errors: validation.error.errors,
      });
      return;
    }

    const { customerId, products } = validation.data;

    // Fetch existing sale with items
    const existingSale = await db.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });

    if (!existingSale) {
      res.status(404).json({ message: "Sale not found" });
      return;
    }

    // Restore stock before deleting old sale
    await db.$transaction(
      existingSale.items.map((item) =>
        db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      )
    );

    // Delete the sale and its items
    await db.saleItem.deleteMany({ where: { saleId } });
    await db.sale.delete({ where: { id: saleId } });

    // Fetch product details
    const productData = await db.product.findMany({
      where: { id: { in: products.map((p) => p.productId) } },
    });

    let total = 0;
    const saleItems = [];

    for (const { productId, quantity } of products) {
      const product = productData.find((p) => p.id === productId);

      if (!product) {
        res.status(400).json({ message: `Product ${productId} not found` });
        return;
      }

      if (product.stock < quantity) {
        res.status(400).json({
          message: `Not enough stock for product ${product.name}`,
        });
        return;
      }

      total += product.price * quantity;
      saleItems.push({
        productId,
        quantity,
        priceAtSale: product.price,
      });
    }

    if (saleItems.length !== products.length) return; // Ensure all products are valid

    // Create new sale with same ID
    const newSale = await db.sale.create({
      data: {
        id: saleId,
        userId,
        customerId,
        total,
        items: { create: saleItems },
      },
      include: { items: true },
    });

    // Deduct stock for new sale items
    await db.$transaction(
      products.map(({ productId, quantity }) =>
        db.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        })
      )
    );

    res.status(200).json(newSale);
  } catch (error) {
    console.error("Error editing sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSale = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { saleId } = req.params;

    const sale = await db.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });

    if (!sale) {
      res.status(404).json({ message: "Sale not found" });
      return;
    }

    await db.$transaction(
      sale.items.map((item) =>
        db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      )
    );

    const deletedSale = await db.sale.delete({
      where: { id: saleId },
    });

    res.status(200).json(deletedSale);
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const sales = await db.sale.findMany({
      where: { userId },
      skip: offset,
      take: Number(limit),
      include: {
        items: true,
        customer: true,
      },
    });

    const totalSales = await db.sale.count();

    res.status(200).json({
      sales,
      totalPages: Math.ceil(totalSales / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
