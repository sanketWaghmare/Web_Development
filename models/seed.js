const mongoose=require("mongoose");
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>console.log("connected to database"))
.catch(()=>console.log ('error'));
const camp =require("./camp");
async function yo(){
    let k;
   
    for(let i=0;i<10;i++)
    {
      k= new camp({title:'yo',geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 70),Math.floor((Math.random() *10) + 50)]
      }})
      await k.save();
    }
    for(let i=0;i<10;i++)
    {
      k= new camp({title:'yo',geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 50),Math.floor((Math.random() *10) + 50)]
      }})
      await k.save();
    }
    for(let i=0;i<10;i++)
    {
      k= new camp({title:'yo',geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *10) + 50),Math.floor((Math.random() *10) + 43)]
      }})
      await k.save();
    }
    for(let i=0;i<10;i++)
    {
      k= new camp({title:'yo',geometry:{
          type:'Point',
          coordinates:[Math.floor((Math.random() *180) + 50),Math.floor((Math.random() *90) + 50)]
      }})
      await k.save();
    }
}
yo();