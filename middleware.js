const Listing = require("./models/listing.js");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create Listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next)=>
{
     let listing = await Listing.findById(id);
    if(!currUser && listing.owner._id.equals(res.locals.currUser._id))
    {
        req.flasg("error" , "you do not have permission to edit")
       return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req,res,next)=>
{
    let {id , reviewId} = req.params;
   let review = await Review.findById(reviewId);
   if(!review.author.equals(res.locals.currUser._id))
   {
    req.flash("error" , "you are not the author of the review")
    return res.redirect(`/listings/${id}`)

   }
   next();
}