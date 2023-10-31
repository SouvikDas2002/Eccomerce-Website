const express=require('express');
const route=express.Router();
const path=require("path");
const fs=require('fs');
const Objid=require('mongodb').ObjectId;
let data=require('../mongodb/connection.js');
const { ObjectId } = require('mongodb');
const orders=require("./orderRoute.js");

route.use("/orders",orders);

// user dashboard
route.get("/dashboard",async(req,res)=>{
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();
    // console.log(wishNumber);

    let products=await data.collection("products").find({}).toArray();
    res.render("./user/dashboard",{uname:req.session.email,products:products,cartNumber,wishNumber,ordersNumber});
})
route.get('/productdetails/:id',async(req,res)=>{
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();

    let single=await data.collection("products").find({_id:new ObjectId(req.params.id)}).toArray();
      res.render('./user/productdetails',{detail:single,cartNumber,wishNumber,ordersNumber});
  })

route.get("/category/:cat",async(req,res)=>{
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();

    let category=await data.collection("products").find({"category":req.params.cat}).sort({name:-1}).toArray()
    res.render("./user/dashboard",{uname:req.session.email,products:category,cartNumber,wishNumber,ordersNumber});

})  

route.get("/profile",(req,res)=>{
    console.log("hello")
    res.send("user profile page");
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
