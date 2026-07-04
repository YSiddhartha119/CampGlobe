const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

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
            author: '6a462fc9ddd88248e8cd33a2',
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                    {
                        url: 'https://res.cloudinary.com/k915psz1/image/upload/v1783093927/YelpCamp/kuhz8bi3ar2itmu0vjcx.jpg',
                        filename: 'YelpCamp/kuhz8bi3ar2itmu0vjcx'
                    }
                    ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odio voluptatum odit non fugiat. Voluptatem corrupti asperiores accusamus illo ipsa molestiae voluptatibus! Maxime ipsum est ipsam maiores facere beatae libero commodi!',
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})