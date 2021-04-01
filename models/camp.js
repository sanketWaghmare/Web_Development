const mongoose= require("mongoose");
const review = require("./review");
const schma=mongoose.Schema;
const img = new schma({
    url:String,
    filename:String
})
img.virtual('thumb').get(function (){
    return this.url.replace('/upload','/upload/w_110');
})
const camp= new mongoose.Schema({
title:String,
price:Number,
image:[img],
geometry: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
description:String,
location:String,
author:{
    type:schma.Types.ObjectId,
    ref:'user'
},  

reviews:[
    {
        type: schma.Types.ObjectId,
        ref:'review'
    }
]
},{toJSON:{virtuals: true}});
camp.virtual('properties.popup').get(function(){
return '<strong><a href="/campground/'+this._id+'">'+this.title+'</a></strong>';
})

camp.post('findOneAndDelete',async function (obj)
{
if(obj)
await review.deleteMany({
    _id:{
        $in: obj.reviews
    }
})


})
module.exports = mongoose.model('camp',camp);
