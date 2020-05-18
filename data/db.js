const mongoose = require("mongoose");
// const db = require('../config/keys').mongoUri;
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

mongoose.Promise = global.Promise;

mongoose
  .connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .catch((error) => handleError(error));

//mongoose.connect(db || 'mongodb://localhost/clientes', { useNewUrlParser: true }).catch((error) => handleError(error));

//mongoose.set('setFindAndModify', false);
mongoose.set("useFindAndModify", false);

const clientsSchema = new mongoose.Schema({
  name: String,
  surname: String,
  namecomplete: String,
  company: String,
  email: String,
  years: Number,
  type: String,
  orders: Array,
  seller: mongoose.Types.ObjectId,
});

const Clients = mongoose.model("clients", clientsSchema);

const linksSchema = new mongoose.Schema({
  title__en: String,
  title__zh: String,
  url: String,
  content__en: String,
  content__zh: String,
  imageUrl: String,
  category: String,
});

const Links = mongoose.model("links", linksSchema);

const LocationsSchema = new mongoose.Schema({
  name: String,
  content__en: String,
  content__zh: String,
  address: String,
  imageUrl: String,
  webUrl: String,
  lat: Number,
  lng: Number,
  tel: String,
  contact: String,
  email: String,
  opening: String,
  facebook: String,
  recycleBy: Array,
  category: String,
  district: String,
});

const Locations = mongoose.model("locations", LocationsSchema);

const EventsSchema = new mongoose.Schema({
  title: String,
  place: String,
  content__en: String,
  content__zh: String,
  imageUrl: String,
  webUrl: String,
  date: String,
  lat: Number,
  lng: Number,
  email: String,
  recomendations: String,
  facebook: String,
  category: Array,
  stateEvent: String,
});

const Events = mongoose.model("events", EventsSchema);

const ShopsSchema = new mongoose.Schema({
  name: String,
  place: String,
  address: String,
  phone: String,
  email: String,
  webUrl: String,
  facebook: String,
  instagram: String,
  lng: Number,
  lat: Number,
  promoded: Boolean,
  imageUrl: String,
  thumbnail: String,
  description: String,
  rate: Number,
  plasticfree: Number,
  category: Array,
});

const Shops = mongoose.model("shops", ShopsSchema);

const productsSchema = new mongoose.Schema({
  name__en: String,
  name__zh: String,
  price: Number,
  link: String,
  newness: Boolean,
  imageUrl: String,
  description__en: String,
  description__zh: String,
  brand: String,
  category: String,
});

const Products = mongoose.model("products", productsSchema);

const AdviceSchema = new mongoose.Schema({
  title__en: String,
  title__zh: String,
  statement__en: String,
  statement__zh: String,
  author: String,
  contentWhy__en: {
    text: String,
    html: String,
  },
  contentWhy__zh: {
    text: String,
    html: String,
  },
  contentWhat__en: {
    text: String,
    html: String,
  },
  contentWhat__zh: {
    text: String,
    html: String,
  },
  contentHow__en: {
    text: String,
    html: String,
  },
  contentHow__zh: {
    text: String,
    html: String,
  },
  imageUrlWhy: String,
  authorWhy: String,
  linkWhy: String,
  imageUrlWhat: String,
  authorWhat: String,
  linkWhat: String,
  date: String,
  products: Array,
});

const Advices = mongoose.model("advices", AdviceSchema);

const orderSchema = new mongoose.Schema({
  order: Array,
  total: Number,
  date: Date,
  client: mongoose.Types.ObjectId,
  state: String,
  seller: mongoose.Types.ObjectId,
});

const Orders = mongoose.model("orders", orderSchema);

const usersSchema = new mongoose.Schema({
  user: String,
  name: String,
  rol: String,
  password: String,
});

// hashear loos password antes de guardarlos

usersSchema.pre("save", function (next) {
  // si es password no esta modificado ejecutar la siguiente funcionj
  if (!this.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (error, hash) => {
      if (error) return next(error);
      this.password = hash;
      next();
    });
  });
});

const Users = mongoose.model("users", usersSchema);

module.exports = {
  Clients,
  Links,
  Locations,
  Products,
  Orders,
  Users,
  Events,
  Shops,
  Advices,
};
