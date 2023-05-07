const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"โปรดใส่ชื่อสินค้า"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"โปรดใส่คำอธิบายสินค้า"]
    },
    price:{
        type:Number,
        required:[true,"โปรดใส่ราคาสินค้า"],
        maxLengh:[7,"ราคาสินค้าสูงเกินไป"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"โปรดใส่หมวดหมู่สินค้า"],
    
    },
    Stock:{
        type:Number,
        required:[true,"โปรดใส่จำนวนสินค้า"],
        maxLengh:[4,"สินค้ามากเกินไป"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required: true,
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],

    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required: true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Product",productSchema)
