const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Voyago"


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
const initDB = async()=>
{
    await listing.deleteMany({});
    await listing.insertMany(initData.data);
    console.log("Data Imported");
}
initDB();