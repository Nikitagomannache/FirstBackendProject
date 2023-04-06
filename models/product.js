const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide product name"],
    trim: true, //remove extra spaces at the end of string
    maxlength: [120, "Product name should not be more than 120 char"],
  },
  price: {
    type: Number,
    required: [true, "Please provide product price"],
    maxlength: [5, "Product price should not be more than 6 digits"],
  },
  description: {
    type: String,
    required: [true, "Please provide product description"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Please select product category from- sgort-sleeves,long-sleeves,sweat-shirts,hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
      message:
        "Please select product category ONLY from- sgort-sleeves,long-sleeves,sweat-shirts,hoodies",
    },
  },
  stock: {
    type: Number,
    required: [true, 'please add number in stock']
  },
  brand: {
    type: String,
    required: [true, "Please add a brand for clothing"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User", // ref to user model
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
