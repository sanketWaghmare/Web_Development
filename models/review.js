const mongoose =require("mongoose");
schema=mongoose.Schema;
const reviewsch= new schema({
    body:String,
    rating:Number,
    author:{
        type:schema.Types.ObjectId,
        ref:'user'
    }
});

module.exports= mongoose.model("review",reviewsch);