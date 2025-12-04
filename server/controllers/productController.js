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


// Controller to get product 
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .select("-photo")
      .sort({ createdAt: -1 });

    res.send({
      success: true,
      products,
    });

  } catch (error) {
    res.send({
      success: false,
      message: "Error getting products",
      error,
    });
  }
};


// Controller to get product photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");

    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.send(product.photo.data);
    } else {
      return res.send("No Image");
    }

  } catch (error) {
    res.send({ error });
  }
};
