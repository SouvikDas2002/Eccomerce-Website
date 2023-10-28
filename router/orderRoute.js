const order = require("express").Router();
const { ObjectId } = require("mongodb");
let data = require("../mongodb/connection.js");

order.get("/wishlist", async (req, res) => {
  let items = await data.collection("wishlist").find({ user: req.session.email }).toArray();

  res.render("./user/wishlist", { productdetails: items });
});
order.get("/wishlist/:productname", async (req, res) => {
  const productname = req.params.productname;
  // console.log(productname);

  const item = await data.collection("wishlist").aggregate([
      { $match: { name: productname } },
      {
        $lookup: {
          from: "products",
          localField: "name",
          foreignField: "name",
          as: "info",
        },
      },
    ])
    .toArray();
  res.redirect(`/users/productdetails/${item[0].info[0]._id}`);
});

order.get("/cart/:productname",async(req,res)=>{
    const productname=req.params.productname;
    // console.log(productname);

    let productSelect=await data.collection("products").find({name:productname}).toArray();
    console.log(productSelect);

    let cartProduct={
        name:productSelect[0].name,
        price:productSelect[0].price,
        productimage:productSelect[0].productimage,
        user:req.session.email
    }
    let existUser = await data.collection("cart").findOne({$and:[{ user: cartProduct.user },{name: cartProduct.name }]});

  if (existUser) {
    console.log("already add in cart");
  } else await data.collection("cart").insertOne(cartProduct);

    res.redirect("/users/orders/wishlist")
})

order.get("/cart",async(req,res)=>{
    let cartProducts=await data.collection("cart").find({user:req.session.email}).toArray();
    // console.log(cartProducts);
    res.render("./user/cart",{products:cartProducts});
})
order.get("/removecart/:id",async(req,res)=>{
    await data.collection("cart").findOneAndDelete({_id:new ObjectId(req.params.id)});
    res.redirect("/users/orders/cart");
})


order.get("/:id", async (req, res) => {
  let product = await data
    .collection("products")
    .findOne({ _id: new ObjectId(req.params.id) });
  res.render("./user/orderDetails", { product: product });
});
order.post("/:id", async (req, res) => {
  let details = {
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zipCode: req.body.zipCode,
    totalAmount: req.body.totalAmount,
    quantity: req.body.quantity,
    dateTime: new Date().toDateString(),
  };
  let neworder = await data.collection("orders").insertOne(details);
  console.log(neworder);

  // update stock of a product
  if (neworder) {
    let product = await data.collection("products").findOne({ _id: new ObjectId(req.params.id) });
    let stock = await data.collection("products").updateOne(product,
        { $set: { stock: product.stock - details.quantity } },
        { returnOriginal: false }
      );
  }
});

order.get("/addWishList/:id", async (req, res) => {
  // console.log(req.params.id);
  let d = await data.collection("products").findOne({ _id: new ObjectId(req.params.id) });
  let wish = {
    name: d.name,
    price: d.price,
    productimage: d.productimage,
    user: req.session.email,
  };
  let existUser = await data.collection("wishlist").findOne({$and:[{ user: wish.user },{name:wish.name}]});
//   console.log(existUser)
 

  if (existUser) {
    console.log("already add in wishlist");
  } else await data.collection("wishlist").insertOne(wish);

  res.redirect("/users/productdetails/" + d._id);
});

data(function (res) {
  if (data) data = res;
  else console.log("got some issue");
});

module.exports = order;
