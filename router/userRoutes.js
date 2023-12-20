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
    // console.log(user);

    let products=await data.collection("products").find({}).toArray();
    let x=[];
    products.forEach((item)=>{
      if(item.brand!=undefined)
      x.push(item.brand);
    })
    let brands=new Set(x);
    res.render("./user/dashboard",{uname:req.session.email,products:products,cartNumber,wishNumber,ordersNumber,user:user,brands:brands});
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

    let category=await data.collection("products").find({"category":req.params.cat}).sort({name:-1}).toArray();
    let products=await data.collection("products").find({}).toArray();
    let x=[];
    products.forEach((item)=>{
      if(item.brand!=undefined)
      x.push(item.brand);
    })
    let brands=new Set(x);
    // res.json({uname:req.session.email,products:category,cartNumber,wishNumber,ordersNumber,brands:brands})
    res.render("./user/dashboard",{uname:req.session.email,products:category,cartNumber,wishNumber,ordersNumber,brands:brands});

})  
route.post("/filterProducts",async(req,res)=>{
  const filters = req.body;

    try {
      // Construct the MongoDB query based on filters
      const query = {};

      if (filters.brand) {
        query.brand = filters.brand;
      }
      
      if (filters.price) {
        if (filters.price === 'below1000') {
          query.price = { $lt: 1000 };
        } else if (filters.price === 'above1000') {
          query.price = { $gte: 1000 };
        }
      }

      // Fetch filtered products from MongoDB
      const products = await data.collection("products").find(query).toArray();

      // Send the filtered products as a JSON response
      res.json(products);
    } catch (error) {
      console.error('Error filtering products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
})

route.get("/profile",async(req,res)=>{
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();
  
    const ordersHistory=await data.collection("orders").find({"primaryEmail":req.session.email}).sort({_id:-1}).toArray()
    // console.log(ordersHistory);
    let userProfile=await data.collection("users").findOne({email:req.session.email});
    // console.log(userProfile)
    res.render("./user/profile",{userdetail:userProfile,cartNumber,wishNumber,ordersNumber,orders:ordersHistory});
})

route.post("/updateProfile",upload.single("profilepic"),async(req,res)=>{
    // console.log(req.file.filename);
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



//* payment :



module.exports=route;
