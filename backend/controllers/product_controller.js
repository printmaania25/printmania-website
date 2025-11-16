import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { name, sizes, mrp, price, pictures, uploadrequired, category, phrases } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    const product = await Product.create({
      name,
      sizes,
      mrp,
      price,
      pictures,
      uploadrequired,
      category,
      phrases: phrases || [] // safe default
    });

    res.json({ success: true, message: "Product created", product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Product.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product updated", product: updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Product.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );

    if (!deleted)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted (soft delete)", product: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ deleted: false });

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
