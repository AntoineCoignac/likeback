const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');


const authRoute = require("./routes/auth.route.js");
const userRoute = require("./routes/user.route.js");
const gigRoute = require("./routes/gig.route.js");
const messageRoute = require("./routes/message.route.js");
const orderRoute = require("./routes/order.route.js");
const deliveryRoute = require("./routes/delivery.route.js");



// App constants
const port = process.env.PORT || 8080;
  
// Create the Express app & setup middlewares
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: [
      /http:\/\/(127(\.\d){3}|localhost)/,
      'https://soft-profiterole-ae906c.netlify.app' // Ajoutez votre URL Netlify ici
    ], credentials: true
  })
);
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());

dotenv.config();
mongoose.set('strictQuery', true);

const connect = async ()=>{
  try{
      await mongoose.connect(process.env.MONGO);
      console.log("Connected to mongodb");
  } catch(error){
      console.log(error);
  }
};

// ***************************************************************************

// Hello World for index page
app.get('/', function (req, res) {
    return res.send("Welcome to the Like API");
})

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/gigs", gigRoute);
app.use("/api/messages", messageRoute);
app.use("/api/orders", orderRoute);
app.use("/api/deliveries", deliveryRoute);

app.use((err, req, res, next)=>{
    const errorStatus = err.status || 500
    const errorMessage = err.message || "Something went wrong!"

    return res.status(errorStatus).send(errorMessage);
})

// Start the server
app.listen(port, () => {
    connect();
    console.log(`Server listening on port ${port}`);
});
  
