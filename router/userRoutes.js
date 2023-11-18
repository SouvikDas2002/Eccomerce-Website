const express=require('express');
const route=express.Router();
const path=require("path");
const fs=require('fs');
const Objid=require('mongodb').ObjectId;
let data=require('../mongodb/connection.js');
const { ObjectId } = require('mongodb');
const orders=require("./orderRoute.js");
const comment=require("./comment.js");
const multer=require('multer');

const storage=multer.diskStorage({
    destination:function(req,file,cb){
      return cb(null,"./profilepic")
    },
    filename: function (req, file, cb) {
    //   console.log(file);
      return cb(null,file.originalname);
    }
  })
  const upload=multer({storage});

route.use("/orders",orders);
route.use("/comment",comment);



// user dashboard
route.get("/dashboard",async(req,res)=>{
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();
    // console.log(wishNumber);
    let user=await data.collection("users").findOne({email:req.session.email});
    console.log(user);

    let products=await data.collection("products").find({}).toArray();
    res.render("./user/dashboard",{uname:req.session.email,products:products,cartNumber,wishNumber,ordersNumber,user:user});
})
route.get('/productdetails/:id',async(req,res)=>{
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();

    let single=await data.collection("products").find({_id:new ObjectId(req.params.id)}).toArray();
    let commentData=await data.collection("comment").find({productname:single[0].name}).toArray();
    // console.log(commentData)
      res.render('./user/productdetails',{detail:single,cartNumber,wishNumber,ordersNumber,comm:commentData});
  })

route.get("/category/:cat",async(req,res)=>{
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();

    let category=await data.collection("products").find({"category":req.params.cat}).sort({name:-1}).toArray()
    res.render("./user/dashboard",{uname:req.session.email,products:category,cartNumber,wishNumber,ordersNumber});

})  

route.get("/profile",async(req,res)=>{
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();

    let userProfile=await data.collection("users").findOne({email:req.session.email});
    // console.log(userProfile)
    res.render("./user/profile",{userdetail:userProfile,cartNumber,wishNumber,ordersNumber});
})

route.post("/updateProfile",upload.single("profilepic"),async(req,res)=>{
    console.log(req.file.filename);
    await data.collection("users").updateOne({email:req.session.email},{$set:{username:req.body.username,profilepic:req.file.filename}});
    res.redirect("/users/profile")
})

route.get("/history",(req,res)=>{
    res.send("user history page");
})




data(function(res){
    if(data)
    data=res;
else
console.log("got some issue");
})
// data=data.getData();

module.exports=route;
