import z from "zod";

// * General Validations

const email = z.string().email({ message: "Invalid email address" });
const password = z
  .string()
  .min(5, { message: "Password must be at least 6 characters long" });
const name = z.string().min(1, { message: "Name is required" });
const image = z.string().min(1, { message: "Image is required" });

const phone = z
  .string()
  .min(10, { message: "Phone number must be at least 10 digits long" });
const address = z.string().min(1, { message: "Address is required" });
const description = z.string().min(1, { message: "Description is required" });

// * Product Validations

const productName = z.string().min(1, { message: "Product name is required" });
const productPrice = z
  .number()
  .min(1, { message: "Price must be a positive number" });

const productStock = z
  .number()
  .min(0, { message: "Stock must be a non-negative number" });

// *  Sales Validations
const saleQuantity = z
  .number()
  .min(1, { message: "Quantity must be at least 1" });

export const loginValidation = z.object({
  email: email,
  password: password,
});

export const registerValidation = z.object({
  name: name,
  email: email,
  password: password,
});

export const addProductValidation = z.object({
  name: productName,
  price: productPrice,
  stock: productStock,
  image: image,
  description: description,
});

export const addCustomerValidation = z.object({
  name: name,
  email: email,
  phone: phone,
  address: address,
});
