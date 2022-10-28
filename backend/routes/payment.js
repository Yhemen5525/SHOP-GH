/** @format */

const express = require("express");
const router = express.Router();

const {
  processPayment,
  payWithMomo,
  sendStripApi,
} = require("../controllers/paymentController");

const { isAuthenticatedUser } = require("../middlewares/auth");

//authentication tempraly removed
router.route("/payment/payWithMomo").post(payWithMomo);

router.route("/payment/process").post(isAuthenticatedUser, processPayment);

router.route("/stripeapi").get(isAuthenticatedUser, sendStripApi);

module.exports = router;
