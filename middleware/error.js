const ErrorHandler = require("../utils/errorhander");

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";


    // Mongodb ID Error
    if(err.name === "CastError"){
        const message = `ไม่พบสิ่งที่ท่านตามหา. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // mongoose duplicate key error
    if(err.code === 11000 ){
        const message = `${Object.keys(err.keyValue)} นี้ถูกใช้งานไปแล้ว`
        err = new ErrorHandler(message, 400);
    }


    // JWT Error
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is invalid, try again`;
        err = new ErrorHandler(message, 400);
    }


    // JWT Expire error
    if(err.name === "TokenExpireError"){
        const message = `Json Web Token is Expired, try again`;
        err = new ErrorHandler(message, 400);
    }


    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};