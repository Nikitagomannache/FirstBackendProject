const bigPromise = require('../middlewares/bigPromise')
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey = bigPromise(async (req, res, next) => {
    res.status(200).json({
        stripeKey: process.env.STRIPE_API_KEY
    })
});

exports.captureStripePayment = bigPromise(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount *100,
        currency: 'inr',
        //optional
        metadata: { integration_check: 'accept_a_payment' }
    });

    res.status(200).json({
        success: true,
        amount:req.body.amount,
        client_secret: paymentIntent.client_secret
    })
});

exports.sendRazorPay = bigPromise(async (req, res, next) => {
    res.status(200).json({
        razorKey: process.env.RAZORPAY_API_KEY
    })
});

exports.captureRazorPayPayment = bigPromise(async (req, res, next) => {
    var instance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET
    })
    var options = {
        amount: req.body.amount, // amount in the smallest currency unit
        currency: "INR",
    };
    const myOrder = await instance.orders.create(options);
    res.status(200).json({
        success:true,
        amount:req.body.amount,
        orders:myOrder
    })
});
