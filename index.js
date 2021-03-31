if(process.env.NODE_ENV !=="production")
{
    require('dotenv').config();
}

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const express=require("express");
app=express();
const multer  = require('multer');


const mapgeo= require("@mapbox/mapbox-sdk/services/geocoding");
const mongoose= require("mongoose");
const camp=require("./models/camp");
const method=require("method-override")
const ejsmate=require("ejs-mate");
const bjoi=require("joi");
const Review= require("./models/review"); 
const session= require("express-session");
const flash= require("connect-flash");
const passport=require("passport");
const passportl=require("passport-local");
const user=require("./models/user");
const mapboxtoken = process.env.maptoken;
const geo=mapgeo({accessToken:mapboxtoken});
const mongosanatize=require("express-mongo-sanitize");
const sanitizeHTML=require("sanitize-html");
const helmet=require('helmet');
const msession=require("connect-mongo");
const dburl=process.env.dburl;



cloudinary.config({
    cloud_name: process.env.cloudname,
    api_key: process.env.cloudkey,
    api_secret: process.env.cloudsecret
});
const storage = new CloudinaryStorage({
  cloudinary,
  params : {
  folder:'caamp',
  allowedFormats: ['jpeg','png','jpg']
  }
});

const upload = multer({ storage});
async function isowner (req,res,next){
    const c=await camp.findById(req.params.id);
    if(!c.author.equals(req.user._id))
    {
        req.flash("error","you dont have permission");
        return res.redirect("/campground/"+req.params.id);
    }
    next();
}
async function isrowner (req,res,next){
    const c=await Review.findById(req.params.rid);
    if(!c.author.equals(req.user._id))
    {
        req.flash("error","you dont have permission");
        return res.redirect("/campground/"+req.params.id);
    }
    next();
}
function islogin(req,res,next) {
    if(!req.isAuthenticated())
    {
        req.session.returnto=req.originalUrl;
        
        req.flash('error',"you must be logedin");
        return res.redirect("/user/login")
    }
    next();
    
}
const secret =process.env.secret;
const store = msession.create({
    mongoUrl: dburl,
    touchAfter: 8 * 60 * 60,
    crypto: {
        secret:secret
    }
});

const sesconfig={
    store:store,
    name:"yo",
    secret:secret,
    resave:false,
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*10,
        maxAge: 1000*60*60*24*10,
    }
}
class expresserror extends Error{
    constructor(message,statuscode)
    {
        super();
        this.message=message;
        this.statuscode=statuscode;
    }

}
function catcher(fun)
{
    return (res,req,next)=> {
        fun(res,req,next).catch(next);
    }
}

const extension =(j)=>({
    type:'string',
    base: j.string(),
    messages:{
        'string.escapeHTML':'{{#label} must not include HTML'
    },
    rules:{
        escapeHTML:{
            validate(value,helpers) {
                const clean= sanitizeHTML(value,{
                    allowedTags:[],
                    allowedAttributes:{},
                });
                if(clean!==value) return helpers.error('string.escapeHTML',{value})
                return clean;
            }
        }
    }
});
const joi = bjoi.extend(extension);




function valid (req,res,next)
{
  const campschema= joi.object({
        camps:joi.object({
            title:joi.string().required().escapeHTML(),
            location:joi.string().required().escapeHTML(),
            description:joi.string().required().escapeHTML(),
            price:joi.number().min(0).required(),
           
        }).required(),
        deleteimages: joi.array()  
      });
      const result=campschema.validate(req.body);
      if(result.error)
      { 
    throw new expresserror(result.error.details[0].message,400);
      }
      next();
}
function validreview (req,res,next)
{
  const reviewschema= joi.object({
        review:joi.object({
            body:joi.string().required().escapeHTML(),
            rating:joi.number().min(0).max(5).required(),
         }).required()  
      });
      const result=reviewschema.validate(req.body);
      if(result.error)
      { 
    throw new expresserror(result.error.details[0].message,400);
      }
      next();
}
mongoose.connect(dburl, {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>console.log("connected to database"))
.catch((e)=>console.log (e));

const path =require("path");
const { findById } = require("./models/camp");


app.engine('ejs',ejsmate);
app.use(helmet({
    contentSecurityPolicy: false,
  }));
app.use(mongosanatize());
app.use(method("_method"));
app.use(session(sesconfig));
app.use(flash());
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.listen(3000,()=>console.log("listening"));
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportl(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next)=>{
   
   
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.user=req.user;
    next();
})
app.get("/home",(req,res)=>{
    
    res.render("home");
    });
app.get("/campground",catcher(async(req,res)=>{
let campground=await camp.find({});
res.render("index",{campground});
}));

app.get("/campground/new",islogin,async(req,res)=>{
    

    res.render("new");
})

app.post("/campground",islogin,upload.array('image'),valid,catcher(async(req,res,next)=>
{
    const geodata=await geo.forwardGeocode({
        query: req.body.camps.location,
        limit:1
    }).send();
    
    const a = new camp(req.body.camps);
    a.geometry=geodata.body.features[0].geometry;
    a.image=req.files.map(k=>({url:k.path,filename:k.filename}));
    a.author=req.user._id;
    await a.save();
    req.flash('success,"sucessfully created a new campground');
    res.redirect("/campground/"+a._id);
}));

app.get("/campground/:id",catcher(async(req,res)=>{
let campground= await camp.findById(req.params.id).populate({path:"reviews",populate:{path:"author"}}).populate("author");

if(campground)
{
    res.render("id",{campground});
}
else{
    req.flash('error',"Can not find campground");
    return  res.redirect("/campground");
}

    

}));


app.get("/campground/:id/edit",islogin,catcher(isowner),catcher(async(req,res)=>
{
     const b=await camp.findById(req.params.id);
     if(!b)
     {
         req.flash('error',"campground not found")
         return res.redirect("/campground/"+req.params.id);
     }
     
     res.render("edit",{b});
}))
app.put("/campground/:id",islogin,catcher(isowner),upload.array('image'),valid,catcher(async(req,res)=>{
    const c=await camp.findById(req.params.id);
   
    c.title=req.body.camps.title;
    c.location=req.body.camps.location;
    c.price=req.body.camps.price;
    c.description=req.body.camps.description;
    const img= req.files.map(k=>({url:k.path,filename:k.filename}));
    c.image.push(...img);
    await c.save();
    
    if(req.body.deleteimages){
        for(let filename of req.body.deleteimages)
        {
            await cloudinary.uploader.destroy(filename);
        }
       await  c.updateOne({$pull:{image:{filename:{$in: req.body.deleteimages}}}})
    }
    req.flash('success',"Successfully updated");
    res.redirect("/campground/"+req.params.id)
}))
app.delete("/campground/:id",islogin,catcher(isowner),catcher(async(req,res)=>{
    await camp.findByIdAndDelete(req.params.id);
    req.flash('success',"deleted campground");
    res.redirect("/campground");

}))
app.get("/register",(req,res)=>{
    res.render("register");

})
app.post("/register",catcher(async(req,res)=>{
  try{  const ruser =await user.register( await new user({email:req.body.email,username:req.body.username}),req.body.password);
  req.flash("success","register Successfully");
  req.login(ruser,err=>{
      if(err) return next(err);
  })
  res.redirect("/register");
}
catch(e)
{
    req.flash("error",e.message);
    res.redirect("/register");
}
}))
app.get("/user/login",(req,res)=>{
    res.render("login");
})
app.post("/user/login",passport.authenticate("local",{failureFlash:true,failureRedirect:"/user/login"}),(req,res)=>{
    req.flash("success","Welcome back");
   const url=req.session.returnto || '/campground' ;
   delete req.session.returnto; 
    res.redirect(url);
})
app.get("/logout",(req,res)=>
{
    req.logout();
    req.flash("success","you are loged out");
    res.redirect("/campground");
})


app.post("/campground/:id/review",islogin,validreview,catcher(async(req,res)=>
{
    const c= await camp.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author=req.user._id;
    await review.save();
    c.reviews.push(review);
    await c.save();
    req.flash('success',"Created new review");
    
    res.redirect("/campground/"+req.params.id);
}))
app.delete('/campground/:id/review/:rid',islogin,catcher(isrowner),catcher(async(req,res)=>
{
   await  camp.findByIdAndUpdate(req.params.id,{$pull:{reviews:req.params.rid}});
   await Review.findByIdAndDelete(req.params.rid);
   req.flash('success',"deleted review");
   
   res.redirect("/campground/"+req.params.id);
}))
app.all("*",(req,res,next)=>{
    throw new expresserror("page not found",404);
    // next(new expresserror("page not found",404));

})
app.use((err,req,res,next)=>{
    const {statuscode=500,message} = err;
    res.render("error",{err});
    
})