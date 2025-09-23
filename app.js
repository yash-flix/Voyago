const express = require('express');
const mongoose = require("mongoose");
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");




app.use(methodOverride('_method'));
 
const MONGO_URL = "mongodb://127.0.0.1:27017/Voyago";
app.set("views" , path.join(__dirname , "views"));
app.set("view engine" , "ejs");

app.use(express.static(path.join(__dirname , "public")))
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);

const listings = require("./routes/listing.js")
const reviews = require("./routes/review.js")


async function main()
{
    await mongoose.connect(MONGO_URL);
}
main()
.then((res)=> {
    console.log("MongoDB is connected");
})
.catch((err)=>
{
    console.log(err);
})


app.get("/" , (req,res)=>
{
    res.render("listings/home.ejs");
})




// app.get("/testListing", async (req,res)=>
// {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "This is the best villa in the town by the beach ",
//         price:12000,
//         location:"Calangute, Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succes");
// })

app.use("/listings" , listings )
app.use("/listings/:id/reviews" , reviews );


app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"))
})

app.use((err,req,res,next)=>
{
    let {statusCode = 500 , message = "Something went wrong!"} = err;
    // res.status(statusCode).send(message);
   res.status(statusCode).render("error.ejs", { statusCode, message, error: err });
})



app.listen(8080,()=>{
    console.log("Server is running")
});
