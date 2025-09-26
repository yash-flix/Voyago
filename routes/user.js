const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");


const passport = require("passport");


router.get("/signup" , (req,res)=>
{
    res.render("users/signUp.ejs");

});

router.post("/signup", wrapAsync(async (req,res)=>
{
    try{

        let {username , email , password} = req.body;
        const newUser = new User({email , username });
       const registeredUser = await  User.register(newUser,password);
       console.log(registeredUser);
       req.flash("success" , "User Registered Successfully!");
       res.redirect("/listings")
    }
    catch(e)
    {
        req.flash("error" , e);
        req.redirect("/signUp")

    }

}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", 
    passport.authenticate("local", {
        failureRedirect: "/login", 
        failureFlash: true
    }), 
    async (req, res) => {  
        req.flash("success", "Welcome back!");
        res.redirect("/listings");  
    }
);

module.exports = router;

