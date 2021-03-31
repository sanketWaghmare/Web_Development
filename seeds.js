const express=require("express");
app=express();
const mongoose= require("mongoose");
const camp=require("./models/camp");
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>console.log("connected to database"))
.catch(()=>console.log ('error'));


async function seed()
{
    await camp.deleteMany({});
    c= new camp({
        title:"Spiti Valley",
        location:"spiti, Himachal Pradesh",
        description:"good place",
        

        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
    c= new camp({
        title:"Chandratal Lake",
        location:"Lahual, Himachal Pradesh",
        description:"good place",
        
        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
    c= new camp({
        title:"Solang Valley",
        location:"Manali,Himachal Pradesh",
        description:"good place",
        
        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
    c= new camp({
        title:"Tso Moriri",
        location:"Ladakh,J&K",
        description:"good place",
        
        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
    c= new camp({
        title:"Rishikesh",
        location:"Uttarakhand",
        description:"good place",
        
        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
    c= new camp({
        title:"Mussoorie",
        location:"Dehradun,Uttarakhand",
        description:"good place",
        
        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
    c= new camp({
        title:"Nameri Eco Camp",
        location:"Sonitpur, Assam",
        description:"good place",
        
        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
    c= new camp({
        title:"Anjuna beach",
        location:"North Goa,Goa",
        description:"good place",
        
        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
    c= new camp({
        title:"Sam Sand Dunes",
        location:"Jaisalmer,Rajasthan",
        description:"good place",
        
        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
    c= new camp({
        title:"Neora Valley Camp",
        location:"Neora Valley Camp,West Bengal",
        description:"good place",
        
        price:1000,geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }
    })
    await c.save();
}
seed().then(()=>mongoose.connection.close())
