const express = require("express");
const login = express.Router();
const bcrypt = require("bcrypt");
let user = require("./mongodb/connection");
const passport = require("passport");
require('dotenv').config();
require("./passport-setup")
const cookieSession=require('cookie-session');

login.use(passport.initialize());
login.use(passport.session());

login.get("/", (req, res) => {
  if (req.session.email && req.session.role == "user")
  res.redirect(`/users/dashboard`);
else if (req.session.email && req.session.role == "admin")
res.redirect(`/admin/dashboard`);
else res.render("login", { message: "" });
});
  
  login.post("/login", async(req, res) => {
    // let checkPass=await bcrypt.hash(req.body.password,10);
      // console.log("login");

  if (req.body.role != "user") {
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    try {
      const validUser = await user
        .collection("admin")
        .findOne({ email: email });
      if (validUser) {
        const isPasswordValid = await bcrypt.compare(
          password,
          validUser.password
        );

        if (isPasswordValid && validUser.role == role) {
          // console.log(validUser);
          
          req.session.email=req.body.email;
           req.session.role=req.body.role;
           res.redirect(`/admin/dashboard`)

        } else {
          console.log("Invalid password or role");
          res.render('login');
        }
      } else {
        console.log("user not found");
        res.render('login');
      }
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  } else if (req.body.role == "user") {
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    try {
      const validUser = await user
        .collection("users")
        .findOne({ email: email });
      
      if (validUser) {
        const isPasswordValid = await bcrypt.compare(
          password,
          validUser.password
        );

        if (isPasswordValid && validUser.role == role) {
          console.log(validUser);
          
          req.session.email=req.body.email;
           req.session.role=req.body.role;
           res.redirect(`/users/dashboard`)

        } else {
          console.log("Invalid password or role");
          res.render('login');
        }
      } else {
        console.log("user not found");
        res.render('login');
      }
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }
});
login.get("/google",passport.authenticate("google",{scope:['profile','email']}))

login.get('/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),
 async function(req,res){
    // console.log(req.user.email)
    req.session.email=req.user.email;
    req.session.role="user";
    req.session.username=req.user.displayName;
    req.session.profilepic=req.user.photos[0].value;

    let validuser=await user.collection("users").findOne({email:req.user.email});
    console.log(validuser);
    if(!validuser){
      let newUser={
        email:req.user.email,
        role:"user",
        username:req.user.displayName,
        profilepic:req.user.photos[0].value
      }
      let result=await user.collection("users").insertOne(newUser);
      console.log(result);
    } 

    res.redirect('/users/dashboard');
  
}
)

user(function (res) {
  if (user) user = res;
  else {
    console.log("not valid user");
  }
});
// user=user.getData();

module.exports = login;
