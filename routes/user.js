const express = require("express");
const router = express.Router();
const {
  signUp,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetail,
  changePassword,
  updateUserdetails,
  adminAllUser,
  managerAllUser,
  adminGetOneUser,
  adminUpdateOneUserDetail,
  adminDeleteOneUserDetail,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");

//user
router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetail);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserdetails);

//adminOnly
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetail)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUserDetail);

//ManagerOnly
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);

module.exports = router;
