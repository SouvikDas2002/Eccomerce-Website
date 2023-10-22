const express = require("express");
const signUp = express.Router();
const fs = require("fs");
const bcrypt=require('bcrypt');
let newuser=require('./mongodb/connection');

signUp.get("/", (req, res) => {
  res.render("signUp");
});
signUp.post("/", async(req, res) => {
  // console.log(req.body);
  let hashedPass= await bcrypt.hash(req.body.password,10);
  
  if (req.body.role == "user") {
    
          const existuser=await newuser.collection('users').findOne({email:req.body.email});
          if(existuser){
            console.log("user already exists")
          }else{

            let userCredentials={
            email:req.body.email,
            password:hashedPass,
            role:req.body.role
          }
            let user=await newuser.collection('users').insertOne(userCredentials)
            console.log(user);
          }
    res.redirect("/login");
  } else {
  
    const existuser=await newuser.collection('admin').findOne({email:req.body.email});
          if(existuser){
            console.log("user already exists")
          }else{
    let userCredentials=
          {
            email:req.body.email,
            password:hashedPass,
            role:req.body.role
          }
    let user=await newuser.collection('admin').insertOne(userCredentials)
    console.log(user);
        }
    res.redirect("/login");
  }
});
newuser(function (res) {
  if (newuser) newuser = res;
  else {
    console.log("not valid user");
  }
});
// newuser=newuser.getData();

module.exports = signUp;
