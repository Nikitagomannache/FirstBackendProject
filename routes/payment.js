const express = require("express");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");
const { sendStripeKey, sendRazorPay, captureStripePayment, captureRazorPayPayment } = require("../controllers/PaymentController");

router.route("/stripeKey").get(isLoggedIn, sendStripeKey);
router.route("/razorPayKey").get(isLoggedIn, sendRazorPay);

router.route("/capturestripe").post(isLoggedIn, captureStripePayment);
router.route("/capturerazorpay").post(isLoggedIn, captureRazorPayPayment);

module.exports = router;
