import productModel from "../models/productModel.js";
import slugify from "slugify";
import fs from "fs";

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;

    if (!name) return res.send({ error: "Name is required" });
    if (!description) return res.send({ error: "Description is required" });
    if (!price) return res.send({ error: "Price is required" });
    if (!category) return res.send({ error: "Category is required" });
    if (!quantity) return res.send({ error: "Quantity is required" });

    const product = new productModel({ ...req.fields, slug: slugify(name) });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.send({ success: true, message: "Product created", product });

  } catch (error) {
    res.send({ success: false, message: "Error creating product", error });
  }
};
