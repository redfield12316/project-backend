const Product = require('../models/productModel');
const ErrorHander = require('../utils/errorhander');
const catchAsyncError = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { query } = require('express');
const cloudinary = require("cloudinary")


// เพิ่มสินค้า -- ผู้ดูแล
exports.createProduct = catchAsyncError(async (req, res, next) => {
    let images = [];
  
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        resource_type:"auto",
        folder: "products",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  
    req.body.images = imagesLinks;
    req.body.user = req.user.id;
  
    const product = await Product.create(req.body);
  
    res.status(201).json({
      success: true,
      product,
    });
  });


// ดึงสินค้าทุกชิ้น
exports.getAllProducts = catchAsyncError(async (req,res,next)=>{
    
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();    

    const apiFeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    
    let products = await apiFeature.query.clone();

    let filteredProductsCount  = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query;

    res.status(200).json({
        success:true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });

});

// ดึงสินค้า (admin)
exports.getAdminProducts = catchAsyncError(async (req,res,next)=>{
    const products = await Product.find();

    res.status(200).json({
        success:true,
        products,
    });

});

// ค้นหารายละเอียดสินค้า
exports.getProductDetails = catchAsyncError(async(req,res,next)=>{
   
    const product = await Product.findById(req.params.id);


    if(!product){
        return next(new ErrorHander("ขออภัย ไม่พบสินค้าที่ท่านตามหา",404));
    }

    //หากพบสินค้า
    res.status(200).json({
        success:true,
        product,
    });
});

// อัพเดตสินค้า -- ผู้ดูแล
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
  
    if (!product) {
      return next(new ErrorHander("ไม่พบสินค้า", 404));
    }
  
    let images = [];
  
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    if (images !== undefined) {
      // ลบภาพจาก Cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }
  
      const imagesLinks = [];
  
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });
  
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
  
      req.body.images = imagesLinks;
    }
  
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
      product,
    });
  });

// ลบสินค้า

exports.deleteProduct = catchAsyncError(async(req, res, next)=>{

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHander("ขออภัย ไม่พบสินค้าที่ท่านตามหา",404));
    }

    // ลบออกจาก Cloudinary ด้วย
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne();

    res.status(200).json({
        success:true,
        message:"สินค้าถูกลบ"
    });
});

// สร้างรีวิว แก้ไขรีวิว
exports.createProductReview = catchAsyncError(async (req, res, next)=> {
     const {rating, comment, productId} = req.body
   
     const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if(isReviewed){
        product.reviews.forEach(rev => {
            if(rev.user.toString() === req.user._id.toString())
            rev.rating=rating,
            rev.comment=comment
        });
    }
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    let avg=0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg 
    / product.reviews.length;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
    });
});

//ดึงคำรีวิวของสินค้านั้นๆ
exports.getProductReviews = catchAsyncErrors(async (req,res,next) => {
    const product = await Product.findById(req.query.id);

    if(!product) {
        return next(new ErrorHander("ไม่พบสินค้า",404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// ลบรีวิว
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if(!product) {
        return next(new ErrorHander("ไม่พบสินค้า",404));
    }

    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings=0;

    if(reviews.length===0){
      ratings = 0; 
    }else{
      ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
    {
        reviews,
        ratings,
        numOfReviews,
    },
    {
        new:true,
        runValidators:true,
        useFindAndModify:false,
    }
);

    res.status(200).json({
        success:true
    });
});