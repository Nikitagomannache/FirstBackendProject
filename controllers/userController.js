const User = require("../models/user");
const bigPromise = require("../middlewares/bigPromise");
const cookieToken = require("../utils/cookieToken");
const customError = require("../utils/customErrors");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signUp = bigPromise(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return next(new customError("Name ,email and password is required", 400));
  }
  if (!req.files) {
    return next(new customError("Photo is required", 400));
  }
  let file = req.files.photo;
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });
  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = bigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  //check for email and pass presence
  if (!email || !password) {
    return next(new customError("Please provide email and password", 400));
  }
  //get user from db
  const user = await User.findOne({ email }).select("+password");
  //if user not found in db
  if (!user) {
    return next(new customError("You are not registered", 400));
  }
  //match the pass
  const isPasswordCorrect = await user.isValidatedPassword(password);
  //if pass do not match
  if (!isPasswordCorrect) {
    return next(new customError("Email and password does not match", 400));
  }
  //all goes good send token
  cookieToken(user, res);
});

exports.logout = bigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Successfully logout",
  });
});

exports.forgotPassword = bigPromise(async (req, res, next) => {
  //collect email
  const { email } = req.body;
  const user = await User.findOne({ email });
  //user not found in db
  if (!user) {
    return next(new customError("Email not found as registered", 400));
  }
  //get token for user model method
  const forgotToken = user.getForgotPasswordToken();
  //save user field in bd
  await user.save({ validateBeforeSave: false }); //valiatebeforepassword optional
  //craete url
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;
  //craft a message
  const message = `Copy paste this link in you url and hit enter \n\n ${myUrl}`;
  try {
    await mailHelper({
      email: user.email,
      subject: "LCO-Password reset email",
      message,
    });
    //if email success
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new customError(error.message, 500));
  }
});

exports.passwordReset = bigPromise(async (req, res, next) => {
  const token = req.params.token;
  const encryToken = crypto.createHash("sha256").update(token).digest("hex"); //encrypt the token from url
  const user = await User.findOne({
    forgotPasswordToken: encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) {
    return next(new customError("Token is invalid or expired", 400));
  }
  console.log("hereeee");
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new customError("Password and confirm password do not match", 400)
    );
  }
  user.password = req.body.password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;
  await user.save();
  //send a json res or send token
  cookieToken(user, res);
});

exports.getLoggedInUserDetail = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = bigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select("+password");
  console.log("userr", user);
  const isCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );
  if (!isCorrectOldPassword) {
    return next(new customError("Old password is incorrect", 400));
  }
  user.password = req.body.password;
  await user.save();
  cookieToken(user, res);
});

exports.updateUserdetails = bigPromise(async (req, res, next) => {
  //add a check for email and name in body
  // const name = req.body.name
  // const email = req.body.email
  // if (!name || !email) {
  //   return next(new customError('Name and email is required', 400))
  // }
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };
  if (req.files) {
    const user = await User.findById(req.user.id);
    const imageId = user.photo.id;
    //delete photo on cloudinary
    const resp = await cloudinary.v2.uploader.destroy(imageId);
    //upload new pic
    let file = req.files.photo;
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    // user
  });
});

exports.adminAllUser = bigPromise(async (req, res, next) => {
  console.log("res", req);
  // select all users
  const users = await User.find();

  // send all users
  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetOneUser = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new customError("No user Found", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateOneUserDetail = bigPromise(async (req, res, next) => {
  //add a check for email and name in body
  // const name = req.body.name
  // const email = req.body.email
  // if (!name || !email) {
  //   return next(new customError('Name and email is required', 400))
  // }
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  if (req.files) {
    const user = await User.findById(req.params.id);
    const imageId = user.photo.id;
    //delete photo on cloudinary
    const resp = await cloudinary.v2.uploader.destroy(imageId);
    //upload new pic
    let file = req.files.photo;
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    // user
  });
});

exports.adminDeleteOneUserDetail = bigPromise(async (req, res, next) => {
  // get user from url
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new customError("No Such user found", 401));
  }
  // get image id from user in database
  const imageId = user.photo.id;
  // delete image from cloudinary
  const image = await cloudinary.v2.uploader.destroy(imageId);
  // remove user from databse
  await user.deleteOne();
  res.status(200).json({
    success: true,
  });
});

exports.managerAllUser = bigPromise(async (req, res, next) => {
  // select all users
  const users = await User.find({ role: "manager" });

  // send all users
  res.status(200).json({
    success: true,
    users,
  });
});
