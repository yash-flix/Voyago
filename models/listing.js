const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review.js")

const listingSchema = new Schema({
    title:
    {
        type:String ,
        required:true
    },
    description:
    {
        type:String
    },
    image:
    {
        type:String,
        set: v => v === "" 
      ? "https://images.unsplash.com/photo-1717537905888-3c9149b0f1cd?q=80&w=464&auto=format&fit=crop" 
      : v
    },
    price :
    {
        type:Number
    }, 
    location:
    {
        type:String
    },
    country:
    {
        type:String
    },
    reviews:
    [{
        type: Schema.Types.ObjectId,
        ref:"Review"
        
    } ] , 
    owner : 
    {
        type:Schema.Types.ObjectId,
        ref:"User" ,
        required:true , 
    }
})

//middleware for deleting reviews when listing is deleted 
listingSchema.post("findOneAndDelete" , async(listing)=>
{
    if(listing)
    {

        await Review.deleteMany({_id :{$in : listing.reviews}})
    }
})
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;