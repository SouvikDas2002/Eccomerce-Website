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
    

    let productSelect=await data.collection("products").find({name:productname}).toArray();
    // console.log(productSelect);

    let cartProduct={
        name:productSelect[0].name,
        price:productSelect[0].price,
        productimage:productSelect[0].productimage,
        user:req.session.email
    }
    console.log(req.session.email);
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
  // console.log(details);
  res.render("./user/orderdetails", { multiproduct: details,cartNumber,wishNumber,ordersNumber });
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
  res.render("./user/orderDetails", { product: product,cartNumber,wishNumber,ordersNumber,multiproduct:null });
});

// * handle multiple orders
order.post("/multiple", async(req,res)=>{
  let cartProducts=await data.collection("cart").find({user:req.session.email}).toArray();
  let productsName=cartProducts.map(product=> product.name);
  let productsImage=cartProducts.map(product=> product.productimage);
  let productsPrice=cartProducts.map(product=> product.price);
  console.log(cartProducts);
  // console.log(productsName);
  let details = {
    productimage:productsImage,
    productname:productsName,
    name: req.body.name,
    primaryEmail: req.session.email,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zipCode: req.body.zipCode,
    totalAmount: productsPrice,
    quantity: req.body.quantity,
    dateTime: new Date().toDateString(),
  };
  // console.log(details);
  await data.collection("orders").insertOne(details);
  res.render('./user/confirmOrder');
})

// * ORDER USER CREDENTIALS ----
order.post("/:id", async (req, res) => {
  try {
      // Get order data from the database
      const orderData = await data.collection("products").findOne({_id: new ObjectId(req.params.id)});
      console.log(orderData);
      
      // Prepare order details
      let details = {
          productimage: orderData.productimage,
          productname: orderData.name,
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

      // Insert the order details into the database
      let newOrder = await data.collection("orders").insertOne(details);

      // Update stock of the product
      if (newOrder) {
          let product = await data.collection("products").findOne({_id: new ObjectId(req.params.id)});
          let stock = await data.collection("products").updateOne(
              {_id: new ObjectId(req.params.id)},
              { $set: { stock: product.stock - details.quantity } },
              { returnOriginal: false }
          );
      }

      // Send email confirmation
      const nodemailer = require("nodemailer");

      // Create a Nodemailer transporter with Gmail SMTP settings
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: "sujoyghoshal.s@gmail.com",
              pass: "cxsp uzwl foeb ftuz"
          }
      });

      // Email message details
      const mailOptions = {
        from: "sujoyghoshal.s@gmail.com",
        to: req.body.email,
        subject: "Order Confirmation",
        text: `Your order has been confirmed. Thank you for shopping with us!
              
              Quantity: ${req.body.quantity}
              Total Amount: ${orderData.price}
              
              Contact Information:
              Address: ${req.body.address}
              City: ${req.body.city}
              State: ${req.body.state}
              
              For any queries regarding your order, please feel free to contact us.`,
        html: `<div style="font-family: Arial, sans-serif; border: 2px solid #ccc; background-color: rgba(255, 255, 255, 0.9); padding: 20px;">
                  <h1 style="text-align: center; margin-bottom: 20px;">Shopsite</h1>
                  <p>Your order has been confirmed. Thank you for shopping with us!</p>
                  <p><strong>Quantity:</strong> ${req.body.quantity}</p>
                  <p><strong>Total Amount:</strong> ${orderData.price}</p>
                  <p><strong>Contact Information:</strong></p>
                  <p><strong>Address:</strong> ${req.body.address}</p>
                  <p><strong>City:</strong> ${req.body.city}</p>
                  <p><strong>State:</strong> ${req.body.state}</p>
                  <p style="margin-top: 20px;">For any queries regarding your order, please feel free to <a href="tel:8927673775">contact us</a>.</p>
              </div>`
    };


      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log("Error sending email:", error);
          } else {
              console.log("Email sent:", info.response);
          }
      });

      // Render confirmation page
      res.render('./user/confirmOrder');
  } catch (error) {
      console.error("Error processing order:", error);
      res.status(500).send("An error occurred while processing your order.");
  }
});





data(function (res) {
  if (data) data = res;
  else console.log("got some issue");
});

module.exports = order;
