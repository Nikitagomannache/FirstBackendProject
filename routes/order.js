const express = require("express");
const router = express.Router();
const { createOrder, getOneOrder, admingetAllOrders, adminDeleteOrder, getLoggedInOrders, adminUpdateOrders } = require("../controllers/orderController");
const { isLoggedIn, customRole } = require("../middlewares/user");

//user
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/myorder").get(isLoggedIn, getLoggedInOrders);
router.route("/order/:id").get(isLoggedIn, getOneOrder);   //order of route matters 


//admin routes
router
    .route("/admin/orders")
    .get(isLoggedIn, customRole("admin"), admingetAllOrders);
router
    .route("/admin/order/:id")
    .put(isLoggedIn, customRole("admin"), adminUpdateOrders)
    .delete(isLoggedIn, customRole("admin"), adminDeleteOrder);


module.exports = router;
