const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


exports.isAuthenticatedUser = catchAsyncErrors( async(req,res,next)=>{
    const {token} = req.cookies;

     if(!token){
        return next(new ErrorHander("โปรดลงชื่อเข้าใช้เพื่อเข้าถึงข้อมูลนี้",401));
     }

     const decodedData = jwt.verify(token,process.env.JWT_SECRET);

     req.user = await User.findById(decodedData.id);
     
     next();
});

exports.authorizeRoles = (...roles) =>{

    return (req,res,next)=>{

        if(!roles.includes(req.user.role)){
            
            return next( new ErrorHander
                (`สถานะ: ${req.user.role} ไม่ได้รับอนุญาตให้เข้าถึงข้อมูลนี้`,403
            )
        );
        }

        next();
    };
};

