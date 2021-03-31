const mongoose= require("mongoose");
const passportlm=require("passport-local-mongoose");
const userschma = new mongoose.Schema({
    email:{
        type:String,
        required: true,
        unique:true
    }
});
userschma.plugin(passportlm);
module.exports = mongoose.model('user',userschma);