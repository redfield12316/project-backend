const Order = require("../models/orderModel.js");
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Product = require('../models/productModel');
const ErrorHander = require('../utils/errorhander');

//สร้าง order ใหม่
exports.newOrder = catchAsyncErrors(async (req,res,next)=>{

    const {
        shippingInfo, 
        orderItems, 
        paymentInfo, 
        itemsPrice, 
        taxPrice,  
        shippingPrice, 
        totalPrice
    } = req.body;

    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        paymentInfo, 
        itemsPrice, 
        taxPrice,  
        shippingPrice, 
        totalPrice,
        paidAt: Date.now(),
        user:  req.user._id,
    });

    res.status(201).json({
        success: true ,
        order,
    });
});


//เรียกข้อมูลการสั่งซื้อ
exports.getSingleOrder = catchAsyncErrors(async (req, res , next) => {
    const order = await Order.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new ErrorHander("ขออภัยไม่พบข้อมูลการสั่งซื้อ",404));
    }

    res.status(200).json({
        success:true,
        order,
    });
});

//เรียกข้อมูลการสั่งซื้อสำหรับผู้ใช้
exports.myOrders = catchAsyncErrors(async (req, res , next) => {
    const orders = await Order.find({ user: req.user._id});

    res.status(200).json({
        success:true,
        orders,
    });
});

//เรียกข้อมูลการสั่งซื้อทั้งหมด -- ผู้ดูแล
exports.getAllOrders = catchAsyncErrors(async (req, res , next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach(order=>{
        totalAmount+=order.totalPrice;
    });

    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    });
});

//ปรับสถานะการสั่งซื้อ -- ผู้ดูแล
exports.updateOrders = catchAsyncErrors(async (req, res , next) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHander("ขออภัยไม่พบข้อมูลการสั่งซื้อ",404));
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHander("คุณได้ส่งสินค้านี้เรียบร้อยแล้ว",400));
    }

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
          await updateStock(o.product, o.quantity);
        });
    }

    order.orderStatus = req.body.status;
    
    if(req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave: false});
    res.status(200).json({
        success:true,
    });
});

async function updateStock(id, quantity){
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({validateBeforeSave: false});
}

//ลบการสั่งซื้อ -- ผู้ดูแล
exports.deleteOrders = catchAsyncErrors(async (req, res , next) => {
    const order = await Order.findById(req.params.id);

    if(!order) {
        return next(new ErrorHander("ไม่พบข้อมูลการสั่งซื้อ", 404));
    }

    await order.deleteOne()

    res.status(200).json({
        success:true,
    });
});