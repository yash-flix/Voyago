const express = require('express');
const mongoose = require("mongoose");
const app = express();
const path = require('path');
const Listing = require("./models/listing.js");
// const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {lisitngSchema, listingSchema , reviewSchema} = require("./schema.js")
const Review = require("./models/review.js");
const methodOverride = require('method-override');

// This must be BEFORE your routes
app.use(methodOverride('_method'));
 
const MONGO_URL = "mongodb://127.0.0.1:27017/Voyago";
app.set("views" , path.join(__dirname , "views"));
app.set("view engine" , "ejs");

app.use(express.static(path.join(__dirname , "public")))
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);

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

const validateListing = (req,res,next)=>
{
let {error} = listingSchema.validate(req.body);
         

          if(error)
          {
            let errMsg = error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400, errMsg);
          }
          else{
            next();
          }
}

const validateReview = (req,res,next)=>
{
let {error} = reviewSchema.validate(req.body);
         

          if(error)
          {
            let errMsg = error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400, errMsg);
          }
          else{
            next();
          }
}
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

//index route
app.get("/listings" ,wrapAsync( async (req,res)=>
{
   const allListings =  await Listing.find({})
   res.render("listings/index.ejs" , {allListings});
}));

//new route
app.get("/listings/new" , (req,res)=>
{
    res.render("listings/new.ejs")
})

//show route
app.get("/listings/:id", wrapAsync(async(req,res)=>
{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

//create route
app.post("/listings" , validateListing , wrapAsync( async (req,res , next)=>
{
          
        // let listing = req.body.listing;
       const newListing = new Listing(req.body.listing); //destructing data and parcing into values from objects
       await newListing.save();
       res.redirect("/listings")
    
}));

//edit route
app.get("/listings/:id/edit" , wrapAsync(async (req,res)=>
{
   let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing}) 
})); 

//edit/update route
app.put("/listings/:id" , validateListing ,wrapAsync(async (req,res)=>
{
    let {id} = req.params;
   await Listing.findByIdAndUpdate(id , {...req.body.listing});
   res.redirect(`/listings/${id}`);


}));

//delete route
app.delete("/listings/:id" , wrapAsync(async (req,res)=>
{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing  )
    res.redirect("/listings")
}));


//POST review route 
app.post("/listings/:id/reviews" , validateReview, wrapAsync(async (req,res)=>
{
    //let {id}= req.params
    //let {review} = req.body
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
    
    console.log("review saved");
   
    res.redirect(`/listings/${listing._id}`)

}));
//DELETE review route
app.delete("/listings/:id/reviews/:reviewId" , wrapAsync(async (req,res)=>
{
    let {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull: {reviews : reviewId}}) 
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);

}))


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
