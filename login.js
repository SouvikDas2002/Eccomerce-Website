const express = require("express");
const login = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");
const { equal } = require("assert");
let user = require("./mongodb/connection");

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
user(function (res) {
  if (user) user = res;
  else {
    console.log("not valid user");
  }
});
// user=user.getData();

module.exports = login;
