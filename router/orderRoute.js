const order = require("express").Router();
const { ObjectId } = require("mongodb");
let data = require("../mongodb/connection.js");

// *whislist //----
order.get("/wishlist", async (req, res) => {
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();


  let items = await data.collection("wishlist").find({ user: req.session.email }).toArray();

  res.render("./user/wishlist", { productdetails: items,cartNumber,ordersNumber });
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
    // console.log(item)
  res.redirect(`/users/productdetails/${item[0].info[0]._id}`);
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

order.get("/wishlist/remove/:id",async(req,res)=>{
    // console.log(req.params.id);
    await data.collection("wishlist").findOneAndDelete({_id:new ObjectId(req.params.id)});
    res.redirect('/users/orders/wishlist');
})
// -----


//  * MY ORDERS PRODUCTS ----
order.get("/myorders/:productname", async (req, res) => {
  const productname = req.params.productname;
  // console.log(productname);

  const item = await data.collection("products").aggregate([
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
    // console.log(item)
  res.redirect(`/users/productdetails/${item[0].info[0]._id}`);
});

// * CART PRODUCTS ----

order.get("/cart/:productname",async(req,res)=>{
    const productname=req.params.productname;
    // console.log(productname);

    let productSelect=await data.collection("products").find({name:productname}).toArray();
    // console.log(productSelect);

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

    res.redirect("/users/orders/cart")
})

order.get("/cart",async(req,res)=>{
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();

    let cartProducts=await data.collection("cart").find({user:req.session.email}).toArray();
    // console.log(cartProducts);
    // calculate total price of cart items
    let totalPrice=0;
    for (let i = 0; i < cartProducts.length; i++) {
      totalPrice+=parseInt(cartProducts[i].price);
    }
    // console.log(totalPrice);
    res.render("./user/cart",{products:cartProducts,wishNumber,ordersNumber,totalPrice});
  })
  order.get("/removecart/:id",async(req,res)=>{
    await data.collection("cart").findOneAndDelete({_id:new ObjectId(req.params.id)});
    res.redirect("/users/orders/cart");
  })

// ----

//  * ORDER ALL CART PRODUCTS ----
  order.get("/orderAll",async(req,res)=>{
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();

  let cartProducts=await data.collection("cart").find({user:req.session.email}).toArray();
  console.log(cartProducts);
  let totalAmount = 0;
    cartProducts.forEach((product) => {
      totalAmount += parseInt(product.price);
    });
  console.log(totalAmount);
  let productImages = cartProducts.map(product => product.productimage);
  let productNamess = cartProducts.map(product => product.name);

  let details={
    name:productNamess,
    price:totalAmount,
    productimage:productImages,
    user:req.session.email
  }
  console.log(details);
  res.render("./user/orderdetails", { product: details,cartNumber,wishNumber,ordersNumber });
})

// * ORDER SINGLE PRODUCT ------
order.get("/ordercart/:name",async(req,res)=>{
    let item=await data.collection("cart").aggregate([
        {$match: { name : req.params.name}},
        {
            $lookup:{
                from: "products",
                localField: "name",
                foreignField: "name",
                as: "info",
            }
        }
    ]).toArray();
    // console.log(item);
    res.redirect(`/users/orders/${item[0].info[0]._id}`);
})

order.get("/myOrders",async(req,res)=>{
    const orders=await data.collection("orders").find({"primaryEmail":req.session.email}).sort({_id:-1}).toArray()
    res.render("./user/myOrders",{products:orders})
})
order.get("/cancelorder/:x",async(req,res)=>{
  await data.collection("orders").findOneAndDelete({_id: new ObjectId(req.params.x)});
  res.redirect("/users/orders/myOrders")
})


order.get("/:id", async (req, res) => {
    let cartNumber=await data.collection("cart").find({user:req.session.email}).count();
    let wishNumber=await data.collection("wishlist").find({user:req.session.email}).count();
    let ordersNumber=await data.collection("orders").find({primaryEmail:req.session.email}).count();

  let product = await data.collection("products").findOne({ _id: new ObjectId(req.params.id) });
  res.render("./user/orderDetails", { product: product,cartNumber,wishNumber,ordersNumber });
});

// * ORDER USER CREDENTIALS ----
order.post("/:id", async (req, res) => {
    const orderData =await data.collection("products").findOne({_id:new ObjectId(req.params.id)});
    console.log(orderData);
    let details = {
    productimage:orderData.productimage,
    productname:orderData.name,
    name: req.body.name,
    primaryEmail: req.session.email,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zipCode: req.body.zipCode,
    totalAmount: orderData.price,
    quantity: req.body.quantity,
    dateTime: new Date().toDateString(),
  };
  let neworder = await data.collection("orders").insertOne(details);
//   console.log(neworder);

  // update stock of a product
  if (neworder) {
    let product = await data.collection("products").findOne({ _id: new ObjectId(req.params.id) });
    let stock = await data.collection("products").updateOne(product,
        { $set: { stock: product.stock - details.quantity } },
        { returnOriginal: false }
      );
  }
  res.render('./user/confirmOrder');
});





data(function (res) {
  if (data) data = res;
  else console.log("got some issue");
});

module.exports = order;
