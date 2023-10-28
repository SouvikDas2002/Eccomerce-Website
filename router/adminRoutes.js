const express=require('express');
const route=express.Router();
const path=require("path");
const fs=require('fs');
const session = require('express-session');
route.use(express.urlencoded({extended:true}));
let data=require("../mongodb/connection.js");
const { ObjectId } = require('mongodb');
const multer=require("multer");

route.use(express.json());

const storage=multer.diskStorage({
    destination:function(req,file,cb){
      return cb(null,"./productImage")
    },
    filename: function (req, file, cb) {
      console.log(file);
      return cb(null,file.originalname);
    }
  })
  const upload=multer({storage});


// admin dashboard
route.get("/dashboard",async (req,res)=>{
    let alldata=await data.collection("products").find({}).toArray();
    res.render("./admin/admindash",{productdetails:alldata,admin:req.session.email});

})
//product details
route.get("/productdetails",async(req,res)=>{  
    res.render('./admin/adminproductdetail',{detail:""});
})
route.post("/productdetails",async(req,res)=>{
    let product=await data.collection("products").find({_id:new ObjectId(req.body.id)}).toArray();
    res.render('./admin/adminproductdetail',{detail:product});
})

//add product
route.get("/productadd",async(req,res)=>{
    res.render("./admin/productadd");
})

route.post("/productadd",upload.single("productimage"), async (req,res)=>{
    // console.log(req.body);
    let newP={
        name:req.body.name,
        price:req.body.price,
        details:req.body.details,
        stock:req.body.stock,
        productimage:req.file.filename,
        category:req.body.category,
    }
        let newProduct=await data.collection("products").insertOne(newP);
        console.log(newProduct);
        if(newProduct){
            let x=newP;
            x.opr="Added";
            // console.log(x);
            let operation=await data.collection("history").insertOne(x);
        }else{
            console.log("Operation not performed");
        }
        res.redirect("/admin/dashboard");


})

// update product

route.get("/productupdate/:id", async(req,res)=>{
    let details=await data.collection("products").find({_id:new ObjectId(req.params.id)}).toArray();
    res.render("./admin/productupdate",{product:details});
})

route.post("/productupdate/:id",async(req,res)=>{
    let details=await data.collection("products").findOneAndUpdate({_id:new ObjectId(req.params.id)},{$set:req.body},{returnOriginal:false});
    res.redirect("/admin/dashboard"); 
    if(details){
        let x=details;
        x.opr="Updated";
        // console.log(x);
        let operation=await data.collection("history").insertOne(x);
    }else{
        console.log("Operation not performed");
    }
})

// delete product
route.get("/productdelete/:id",async(req,res)=>{
    // console.log(req.session.email);
    let delItem=await data.collection("products").findOneAndDelete({_id:new ObjectId(req.params.id)});
    res.redirect(`/admin/dashboard`);
    if(delItem){
        let x={
            name:delItem.name,
            price:delItem.price,
            details:delItem.details,
            productimage:delItem.productimage,
            opr:"Deleted"

        };
        // console.log(x);
        let operation=await data.collection("history").insertOne(x);
    }else{
        console.log("Operation not performed");
    }
})

// search product

route.get('/search',async(req,res)=>{
    console.log(req.query.id);
    let searchData = await data.collection('products').find({_id:new ObjectId( req.query.id) }).toArray();
    res.render('./admin/admindash',{productdetails:searchData,admin:req.session.email})
    console.log(searchData);
})

route.get("/profile",(req,res)=>{
    res.send("user profile page");
})
route.get("/history",async(req,res)=>{
    let products=await data.collection("history").find({}).toArray();
    res.render("./admin/history",{productdetails:products});
})

data(function(res){
    if(data)
    data=res;
else
console.log("got some issue");
})
// data=data.getData();
module.exports=route;
