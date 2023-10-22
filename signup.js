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
    // fs.readFile("users.json", "utf-8", (err, data) => {
    //   let newUser;
    //   let oldrecord;
    //   if (data == "") {
    //     oldrecord = [];
    //   } else {
    //     oldrecord = JSON.parse(data);
    //   }
    //   * checking user exist or not
    //   let results = oldrecord.filter((item) => {
    //     if (
    //       item.email == req.body.email &&
    //       item.role == req.body.role
    //       )
    //       return true;
    //     });
        
    //     if (results.length != 0) {
    //       console.log("user already present please login");
    //     } else {
    //       let userCredentials=
    //       {
    //         email:req.body.email,
    //         password:hashedPass,
    //         role:req.body.role
    //       }

    //     newUser = oldrecord;
    //     newUser.push(userCredentials);

    //     fs.writeFile("users.json", JSON.stringify(newUser), (err) => {
    //       if (err) throw err;
    //       else console.log(`user signUp successful`);
    //     });
    //   }
    // });
    
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
    // fs.readFile("admin.json", "utf-8", (err, data) => {
    //   let newUser;
    //   let oldrecord;
    //   if (data == "") {
    //     oldrecord = [];
    //   } else {
    //     oldrecord = JSON.parse(data);
    //   }
    //   let results = oldrecord.filter((item) => {
    //     if (item.email == req.body.email &&item.role == req.body.role)
    //       return true; 
    //   });
    //   if (results.length != 0) {
    //     console.log("user already present please login");
    //   } else {
    //     let adminCredentials=
    //       {
    //         email:req.body.email,
    //         password:hashedPass,
    //         role:req.body.role
    //       }
    //     newUser = oldrecord;
    //     newUser.push(adminCredentials);
    //     fs.writeFile("admin.json", JSON.stringify(newUser), (err) => {
    //       if (err) throw err;
    //       else console.log(`admin signUp successful`);
    //     });
    //   }

    // });
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
