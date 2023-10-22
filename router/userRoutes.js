const express=require('express');
const route=express.Router();
const path=require("path");
const fs=require('fs');
const Objid=require('mongodb').ObjectId;
let data=require('../mongodb/connection.js');
const { ObjectId } = require('mongodb');

// user dashboard
route.get("/dashboard",async(req,res)=>{

    let products=await data.collection("products").find({}).toArray();
    res.render("dashboard",{uname:req.session.email,products:products});
})
route.get('/productdetails/:id',async(req,res)=>{
    let single=await data.collection("products").find({_id:new ObjectId(req.params.id)}).toArray();
      res.render('productdetails',{detail:single});
  })

route.get("/category/:cat",async(req,res)=>{
    let category=await data.collection("products").find({"category":req.params.cat}).sort({name:-1}).toArray()
    res.render("dashboard",{uname:req.session.email,products:category});

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
