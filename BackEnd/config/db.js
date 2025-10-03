const mongoose=require('mongoose')
const dotenv=require('dotenv').config()

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("mongo connected");
})
.catch(errro=>{
    console.log("nhi connected hue");
})