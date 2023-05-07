const app = require("./app");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database.js");

// จัดการปัญหาข้อผิดพลาดที่ไม่สามารถดำเนินการได้
process.on("uncaughException", (err) =>{
    console.log(`Error: ${err.message}`);
    console.log(`ปิดเซิร์ฟเวอร์เนื่องจากเกิดปัญหาที่ไม่สามารถดำเนินการได้`);
    process.exit(1);
    
});

//config

dotenv.config({path:"backend/config/config.env"});

// เชื่อม db
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const server = app.listen(process.env.PORT,()=> {
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
});


// unhandled promise rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`ปิดเซิร์ฟเวอร์เนื่องจากเกิดปัญหาภายใน`);

    server.close(() => {
        process.exit(1);
    });
});