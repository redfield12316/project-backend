const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const stripe = require("stripe")("sk_test_51MyU7eJdj2MUrCcrKDEAxECm72FRhR3WvOkgcXAxHPxTSr0iUB1mnI0AAKEMT2mufGfnI8xKpg3Iazp5C0HS6iFa00AIWyd5WQ");

exports.processPayment = catchAsyncErrors(async (req,res,next) =>{
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "thb",
        metadata: {
            company: "Sneaker Dudes",
        },
    });
    
    res
        .status(200)
        .json({success:true,client_secret:myPayment.client_secret});
});

exports.sendStripeApiKey = catchAsyncErrors(async (req,res,next) => {
    res.status(200).json({ stripeApiKey:"pk_test_51MyU7eJdj2MUrCcrz2igTeW0pfDZnMBrqeT1iq3xrvnnAJYh2KXkLuWQWcGbFmiThywMJ2rSw1PyBMRdlDIk6GKW00dhB4Veut"});
});