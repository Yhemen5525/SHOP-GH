/** @format */

const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const axios = require("axios");
const uuid = require("uuid");

//mtn momo config
const momo = require("../../my_modules/momo-pay");
//initialize momo
const options = {
  SUB_KEY: process.env.SUB_KEY,
  API_USER: process.env.API_USER,
  API_KEY: process.env.API_KEY,
  HOST: process.env.HOST,
};
momo.initilise(options);

// Process stripe payments   =>   /api/v1/payment/process
exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",

    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

// Send stripe API Key   =>   /api/v1/stripeapi
exports.sendStripApi = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});

// Process mtn payments   =>   /api/v1/payment/processMomo
exports.payWithMomo = catchAsyncErrors(async (req, res, next) => {
  const paymentData = req.body;
  const result = await momo.requestTopay(paymentData);
  const transaction = await momo.getTractionStatus(result.transactionId);

  res.status(200).json(transaction.data);
});
