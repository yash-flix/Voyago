const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const { isLoggedIn, isOwner } = require("../middleware.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage: storage }); 

//middleware
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New route 
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// Create route - with file upload
router.post("/", 
    isLoggedIn, 
    upload.single('listing[image]'), 
    validateListing, 
    wrapAsync(async (req, res) => {
        
        console.log(req.file);
        
        const newListing = new Listing(req.body.listing);
        
        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "New listing created successfully!");
        res.redirect("/listings");
    })
);

// Show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    
    if (!listing) {
        req.flash("error", "Requested Listing does not exist");
        return res.redirect("/listings"); 
    }
    
    res.render("listings/show.ejs", { listing });
}));

// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Requested Listing does not exist");
        return res.redirect("/listings"); 
    }
    
    res.render("listings/edit.ejs", { listing });
}));

// Update route
router.put("/:id", 
    isLoggedIn, 
    isOwner, 
    upload.single('listing[image]'),
    validateListing, 
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        
       
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
            await listing.save();
        }
        
        req.flash("success", "Listing updated!");
        res.redirect(`/listings/${id}`);
    })
);

// Delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}));

module.exports = router;