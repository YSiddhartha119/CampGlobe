const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/camp-globe');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author: '6a4ce5d9c7e8cfdaf78eadb9',
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                    {
                        url: 'https://res.cloudinary.com/k915psz1/image/upload/v1783093927/CampGlobe/fsyzaxzzgl6zc8xgxouf.jpg',
                        filename: 'CampGlobe/fsyzaxzzgl6zc8xgxouf'
                    }
                    ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odio voluptatum odit non fugiat. Voluptatem corrupti asperiores accusamus illo ipsa molestiae voluptatibus! Maxime ipsum est ipsam maiores facere beatae libero commodi!',
            price: price, 
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
        })
        await camp.save();
    }
}




seedDB().then(() => {
    mongoose.connection.close();
})

