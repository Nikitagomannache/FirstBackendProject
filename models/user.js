const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); //default come from node js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [40, "Name should be under 40 char"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    validate: [validator.isEmail, "Please enter email in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    unique: true,
    minlength: [6, "Password should be atlease 6 char"],
    select: false, //to avoid access to password field from db amd model
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//encrypt password before save -hook
userSchema.pre("save", async function (next) {
  //do not use array function
  if (!this.isModified("password")) {
    //when we modify password then only ecrypt it or else do next
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10); //this will access any object from schema
});

//Validating password with passed on user passeword
userSchema.methods.isValidatedPassword = async function (usersendPassword) {
  return await bcrypt.compare(usersendPassword, this.password);
};

//create and return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    //_id given by mongodb
    expiresIn: process.env.JWT_EXPIRY,
  });
};

//Generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function () {
  //generate a long and random string
  const forgotToken = crypto.randomBytes(20).toString("hex");
  // this.forgotPasswordToken = forgotToken

  //optional , for encrypting data by hashing it (make sure to get a hash on backend)
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  //time of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 100;
  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
