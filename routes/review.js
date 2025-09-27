const express = require("express");

const router = express.Router({mergeParams: true}); 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js")
const Review = require("../models/review.js");  
const Listing = require("../models/listing.js"); 
const {isLoggedIn , isReviewAuthor} = require("../middleware.js")   

//middleware
const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//POST review route 
router.post("/", validateReview, isLoggedIn , wrapAsync(async (req,res) => {
    let {id} = req.params; 
    let listing = await Listing.findById(id);
    
    
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
     req.flash("success", "Review added successfully!");
    console.log("review saved");
    res.redirect(`/listings/${listing._id}`)
}));

//DELETE review route
router.delete("/:reviewId", isLoggedIn , isReviewAuthor , wrapAsync(async (req,res) => {
    let {id, reviewId} = req.params; 
    
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
     req.flash("success", "Review Deleted");
    
    res.redirect(`/listings/${id}`);
}));

module.exports = router;