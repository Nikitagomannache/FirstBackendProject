const Product = require("../models/product");
const bigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customErrors");
const cloudinary = require("cloudinary");
const whereClause = require("../utils/whereClause");
const { isDefined } = require("razorpay/dist/utils/razorpay-utils");
const { findById } = require("../models/product");

exports.addProduct = bigPromise(async (req, res, next) => {
  // images

  let imageArray = [];

  if (!req.files) {
    return next(new customError("images are required", 401));
  }
  console.log("iii", req.files);

  if (req.files.photos.length > 1) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  } else {
    let result = await cloudinary.v2.uploader.upload(
      req.files.photos.tempFilePath,
      {
        folder: "products",
      }
    );

    imageArray.push({
      id: result.public_id,
      secure_url: result.secure_url,
    });
  }
  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProduct = bigPromise(async (req, res, next) => {
  const resultPerPage = 2;
  const totalcountProduct = await Product.countDocuments();

  const productsObj = new whereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;
  //products.limit().skip()
  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
  });
});

exports.getOneProduct = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new customError("No product found with this id", 401));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminGetAllProducts = bigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateOneProduct = bigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new customError("No product found with this id", 401));
  }
  if (req.files) {
    let imagesArray = [];
    if (product.photos.length > 1) {
      for (let index = 0; index < product.photos.length; index++) {
        await cloudinary.v2.uploader.destroy(product.photos[index].id);
      }
    } else {
      await cloudinary.v2.uploader.destroy(product.photos.id);
    }
    if (req.files.photos.length > 1) {
      for (let index = 0; index < req.files.photos.length; index++) {
        let result = await cloudinary.v2.uploader.upload(
          req.files.photos[index].tempFilePath,
          {
            folder: "products", //folder name -> .env
          }
        );

        imagesArray.push({
          id: result.public_id,
          secure_url: result.secure_url,
        });
      }
      req.body.photos = imagesArray;
    } else {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos.tempFilePath,
        {
          folder: "products",
        }
      );
      imagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
      req.body.photos = imagesArray;
    }
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteOneProduct = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new customError("No product found with this id", 401));
  }
  //destroy the existing image
  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.v2.uploader.destroy(product.photos[index].id);
  }
  await product.deleteOne();
  res.status(200).json({
    success: true,
    message: "Product deleted Successfully",
  });
});

exports.addReview = bigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment: comment,
  };
  const product = await Product.findById(productId);
  const AlreadyReviewd = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (AlreadyReviewd) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }
  //adjust rating
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //save
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true
  });
});

exports.deleteReview = bigPromise(async (req, res, next) => {
  const { productId } = req.query;
  const product = await Product.findById(productId);
  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== req.user._id.toString()
  );
  const numberOfReviews = reviews.length;
  // adjust ratings
  let ratings
  if (reviews.length > 0) {
    ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
  } else {
    ratings = 0
  }

  //update the product
  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
  });
});

exports.getOnlyReviewForOneProduct = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id)
  res.status(200).json({
    success: true,
    reviews: product.reviews
  })
});

exports.getAllReview = bigPromise(async (req, res, next) => {
  const product = await Product.find()
  let reviews = []

  for (let index = 0; index < product.length; index++) {
    if (product[index].reviews.length > 0) {
      reviews.push(product[index].reviews)
    }
  }
  console.log("product", reviews)
  res.status(200).json({
    success: true,
    reviews: reviews
  })
});