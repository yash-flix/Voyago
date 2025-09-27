const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");


const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");



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
       req.login(registeredUser , (err)=>
    {
        if(err)
        {
            return next(err);
        }
        req.flash("success" , "User Registered Successfully!");
       res.redirect("/listings")
    });}
    catch(e)
    {
        req.flash("error" , e);
        req.redirect("/signUp")

    }

}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", saveRedirectUrl, 
    passport.authenticate("local", {
        failureRedirect: "/login", 
        failureFlash: true
    }), 
    async (req, res) => {  
        req.flash("success", "Welcome back!");
        let redirectUrl = res.locals.redirectUrl || "/listings"
        res.redirect(redirectUrl);  
    }
);
router.get("/logout" , (req,res,next)=>
{
    req.logOut((err)=>
    {
        if(err)
        {
            return next(err);
        }
        req.flash("success" , "User Logged Out");
        res.redirect("/")
    })
})
module.exports = router;

