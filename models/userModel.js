const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"โปรดกรอกชื่อของคุณ"],
        maxLength:[30,"สามารถกรอกชื่อได้ไม่เกิน 30 ตัวอักษร"],
        minLength:[4,"ชื่อต้องประกอบไปด้วยตัวอักษรมากกว่า 4 ตัว"],
    },
    email:{
        type:String,
        required:[true,"โปรดกรอกอีเมลของคุณ"],
        unique:true,
        validate:[validator.isEmail,"โปรดกรอกอีเมลที่มีอยู่จริง"],
    },
    password:{
        type:String,
        required:[true,"โปรดกรอกรหัสผ่านของคุณ"],
        minLength:[8,"รหัสผ่านต้องประกอบไปด้วยตัวเลข หรือตัวอักษรมากกว่า 8 ตัว"],
        select:false,
    },
    avatar:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
    },
    role:{
        type:String,
        default:"user",
    },
    createdAt:{
        type:Date,
        default:Date.now
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }

    this.password = await bcrypt.hash(this.password,10);
});

//JWT TOKEN
userSchema.methods.getJWTToken = function (){
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPRIRE,
    });
};


//เปรียบเทียบรหัสผ่าน
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

// สร้าง token สำหรับรีเซ็ต password
userSchema.methods.getResetPasswordToken = function(){

    //สร้าง token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //hashing และ add เข้า userSchema
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

        this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        return resetToken;
};



module.exports = mongoose.model("User",userSchema);