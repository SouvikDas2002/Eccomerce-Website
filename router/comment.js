const comment=require('express').Router();
const { ObjectId } = require('mongodb');
let data=require('../mongodb/connection.js');
const multer=require("multer");

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        return cb(null,"./comment")
    },
    filename:function(req,file,cb){
        return cb(null,file.originalname);
    }
})
const upload=multer({storage});

comment.get("/:id",async(req,res)=>{
    let commentData=await data.collection("comments").find({}).toArray();
    console.log(commentData);
    res.redirect("/users/productdetails/"+req.params.id)
})

comment.post('/review/:id',upload.single("pic"),async (req,res)=>{
    // console.log(req.params.x);
    let commentItem=await data.collection("products").findOne({_id:new ObjectId(req.params.id)})
    let comm={
        productname:commentItem.name,
        comment:req.body.comment,
        image:req.file.filename,
    }
    await data.collection("comment").insertOne(comm);
    res.redirect("/users/comment/"+req.params.id)
})

data(function(res){
    if(data)
    data=res;
else
console.log("got some issue");
})
module.exports=comment;