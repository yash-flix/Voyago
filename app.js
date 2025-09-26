const express = require('express'); 
const mongoose = require("mongoose"); 
const app = express(); 
const path = require('path'); 
const methodOverride = require('method-override'); 
const ejsMate = require("ejs-mate"); 
const ExpressError = require("./utils/ExpressError.js"); 
const session = require("express-session"); 
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user.js");


app.use(methodOverride('_method'));

const MONGO_URL = "mongodb://127.0.0.1:27017/Voyago";


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate); 


app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));


const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true, 
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
app.serializeUser(User.serializeUser());
app.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Routes
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
.then((res) => {
    console.log("MongoDB is connected");
})
.catch((err) => {
    console.log("MongoDB connection error:", err);
});





app.get("/", (req, res) => {
    res.render("listings/home.ejs");
});


app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", { 
        statusCode, 
        message, 
        error: err 
    });
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});