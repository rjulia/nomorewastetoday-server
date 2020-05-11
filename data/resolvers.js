const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { rejects } = require('assert');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { GraphQLUpload } = require('graphql-upload');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const mkdirp = require('mkdirp');
const promisesAll = require('promises-all');
const shortid = require('shortid');
const fs = require('fs');
const { sendConfirmationEmail } = require('../services/EmailServices')
const {
  Clients, Locations, Links, Products, Orders, Users, Events, Shops, Advices
} = require('./db');
const { RESTDataSource } = require('apollo-datasource-rest');
const { authenticated, validateRole } = require('../helpers/auth-helpers')
const { ObjectId } = mongoose.Types;
dotenv.config({ path: '.env' });
// const path = require('path');

const createToken = (userObj, secret, expiresIn) => {
  const { user } = userObj;
  return jwt.sign({ user }, secret, { expiresIn });
};

const UPLOAD_DIR = './uploads';
const db = lowdb(new FileSync('db.json'));
// Seed an empty DB.
// db.defaults({ uploads: [] }).write()

// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR);
const storeFS = ({ stream, filename }) => {
  const id = shortid.generate();
  const path = `${UPLOAD_DIR}/${id}-${filename}`;
  return new Promise((resolve, reject) => stream
    .on('error', (error) => {
      if (stream.truncated)
      // Delete the truncated file.
      { fs.unlinkSync(path); }
      reject(error);
    })
    .pipe(fs.createWriteStream(path))
    .on('error', (error) => reject(error))
    .on('finish', () => resolve({ id, path })));
};

const storeDB = (file) => db
  .get('uploads')
  .push(file)
  .last()
  .write();

const processUpload = async (upload) => {
  const { filename, mimetype, createReadStream } = await upload;
  const stream = createReadStream();
  const { id, path } = await storeFS({ stream, filename });
  return storeDB({
    id, filename, mimetype, path,
  });
};

// resolvers and Queries

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    getClients: (_root, { limit, offset, seller }) => {
      let filter;
      if (seller) {
        filter = { seller: new ObjectId(seller) };
      }
      return Clients.find(filter)
        .sort({ age: 1 })
        .limit(limit)
        .skip(offset);
    },
    getClient: (_root, { id }) => new Promise((resolve, _object) => {
      Clients.findById(id, (err, client) => {
        if (err) rejects(err);
        else resolve(client);
      });
    }),
    totalClients: (_root) => new Promise((resolve, _object) => {
      Clients.countDocuments({}, (err, count) => {
        if (err) rejects(err);
        else resolve(count);
      });
    }),
    getLinks: (_root, { category }) => {
      let filter;
      if (category) {
        filter = { category: category };
      }
      return Links.find(filter)
    },
    getLink: (_root, { id }) => new Promise((resolve, _object) => {
      Links.findById(id, (err, link) => {
        if (err) rejects(err);
        else resolve(link);
      });
    }),
    getLocations: (_root, { recycleBy, category, district }) => {

      let filterRecycle;
      let filterCategory;
      let filterDistrict;

      if (recycleBy) {
        filterRecycle = { recycleBy: { $in: recycleBy } };
      }
      if (category) {
        filterCategory = { category: category };
      }
      if (district) {
        filterDistrict = { district: district };
      }

      return Locations.find({ ...filterRecycle, ...filterCategory, ...filterDistrict })
    },
    getLocation: (_root, { id }) => new Promise((resolve, _object) => {
      Locations.findById(id, (err, link) => {
        if (err) rejects(err);
        else resolve(link);
      });
    }),
    getEvents: (_root, { category }) => {
      let filter;
      if (category) {
        filter = { category: category };
      }
      return Events.find(filter).sort({ date: -1 })
    },
    getEvent: (_root, { id }) => new Promise((resolve, _object) => {
      Events.findById(id, (err, link) => {
        if (err) rejects(err);
        else resolve(link);
      });
    }),
    getShops: (_root, { category }) => {
      let filter;
      if (category) {
        filter = { category: category };
      }
      return Shops.find(filter).sort({ promoded: -1 })
    },
    getShop: (_root, { id }) => new Promise((resolve, _object) => {
      Shops.findById(id, (err, link) => {
        if (err) rejects(err);
        else resolve(link);
      });
    }),
    getAdvices: (_root) => {
      return Advices.find().populate('product').exec()
    },
    getAdvice: (_root, { id }) => new Promise((resolve, _object) => {
      Advices.findById(id, (err, link) => {
        if (err) rejects(err);
        else resolve(link);
      });
    }),
    getNewsInfo: async (_, __, { dataSources }) => {
      let newsList = await dataSources.newsAPI.getNewsInfo()
      return newsList.articles
    },
    getEmailCampaing: async (_, __, { dataSources }) => {
      let emailsList = await dataSources.emailAPI.getEmailCampaing()
      return emailsList.members
    },

    getProducts: (_root, { category }) => {
      let filter;
      if (category) {
        filter = { category: category };
      }
      return Products.find(filter)
    },
    getProduct: (_root, { id }) => new Promise((resolve, _object) => {
      Products.findById(id, (err, link) => {
        if (err) rejects(err);
        else resolve(link);
      });
    }),
    totalProducts: (_root) => new Promise((resolve, _object) => {
      Products.countDocuments({}, (err, count) => {
        if (err) rejects(err);
        else resolve(count);
      });
    }),
    // para filtrar una base de datos de mongose, por un campo, le pasas entre llaves el valor que quieres filtrar de todos los campos dispobible, en este caso , por client e {cliente}
    getOrders: (_root, { client }) => new Promise((resolve, _object) => {
      Orders.find({ client }, (err, order) => {
        if (err) rejects(err);
        else resolve(order);
      });
    }),
    topClients: (_root) => new Promise((resolve, _object) => {
      Orders.aggregate([
        {
          $match: { state: 'COMPLETE' }
        },
        {
          $group: {
            _id: '$client',
            total: { $sum: '$total' }
          },
        },
        {
          $lookup: {
            from: 'clients',
            localField: '_id',
            foreignField: '_id',
            as: 'client',
          },
        },
        {
          $sort: { total: -1 },
        },
        {
          $limit: 10,
        }
      ], (err, result) => {
        if (err) rejects(err);
        else resolve(result);
      });
    }),
    topSellers: (_root) => new Promise((resolve, _object) => {
      Orders.aggregate([
        {
          $match: { state: 'COMPLETE' },
        },
        {
          $group: {
            _id: '$seller',
            total: { $sum: '$total' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'seller',
          },
        },
        {
          $sort: { total: -1 },
        },
        {
          $limit: 10,
        },
      ], (err, result) => {
        if (err) rejects(err);
        else resolve(result);
      });
    }),
    getUser: (_root, _args, { currentUser }) => {
      if (!currentUser) {
        return null;
      }
      // obtener el usuario actual del request del JWT Verificado
      const user = Users.findOne({ user: currentUser.user });
      return user;
    },
    uploads: () => db.get('uploads').value(),

  },

  Mutation: {
    setClient: (_root, { input }) => {
      const newClient = new Clients({
        name: input.name,
        surname: input.surname,
        namecomplete: `${input.name} ${input.surname}`,
        company: input.company,
        email: input.email,
        years: input.years,
        type: input.type,
        seller: input.seller,
      });
      newClient.id = newClient._id;

      return new Promise((resolve, _obj) => {
        newClient.save((err) => {
          if (err) rejects(err);
          else resolve(newClient);
        });
      });
    },
    uploadClient: (_root, { input }) => new Promise((resolve, _obj) => {
      Clients.findOneAndUpdate(
        { _id: input.id },
        input,
        { new: true },
        (err, client) => {
          if (err) rejects(err);
          else resolve(client);
        },
      );
    }),
    deleteClient: (_root, { id }) => new Promise((resolve, _obj) => {
      Clients.findOneAndDelete({ _id: id }, (err) => {
        if (err) rejects(err);
        else resolve('Your file has been deleted.');
      });
    }),

    setLink: authenticated(
      validateRole('ADMIN')((_root, { input }, context) => {

        const newLink = new Links({
          title__en: input.title__en,
          title__zh: input.title__zh,
          url: input.url,
          content__en: input.content__en,
          content__zh: input.content__zh,
          imageUrl: input.imageUrl,
          category: input.category
        });
        newLink.id = newLink._id;

        return new Promise((resolve, _obj) => {
          newLink.save((err) => {
            if (err) rejects(err);
            else resolve(newLink);
          });
        });
      })),

    uploadLink: authenticated(
      validateRole('ADMIN')((_root, { input }) => new Promise((resolve, _obj) => {
        Links.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (err, link) => {
            if (err) rejects(err);
            else resolve(link);
          },
        );
      }))),

    deleteLink: authenticated(
      validateRole('ADMIN')((_root, { id }) => new Promise((resolve, _obj) => {
        Links.findOneAndDelete({ _id: id }, (err) => {
          if (err) rejects(err);
          else resolve('Your file has been deleted.');
        });
      }))),

    setLocation: authenticated(
      validateRole('ADMIN')((_root, { input }) => {
        const newLocation = new Locations({
          name: input.name,
          content__en: input.content__en,
          content__zh: input.content__zh,
          address: input.address,
          imageUrl: input.imageUrl,
          webUrl: input.webUrl,
          lat: input.lat,
          lng: input.lng,
          tel: input.tel,
          contact: input.contact,
          email: input.email,
          opening: input.opening,
          facebook: input.facebook,
          recycleBy: input.recycleBy,
          category: input.category,
          district: input.district
        });
        newLocation.id = newLocation._id;

        return new Promise((resolve, _obj) => {
          newLocation.save((err) => {
            if (err) rejects(err);
            else resolve(newLocation);
          });
        });
      })),

    uploadLocation: authenticated(
      validateRole('ADMIN')((_root, { input }) => new Promise((resolve, _obj) => {
        Locations.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (err, Location) => {
            if (err) rejects(err);
            else resolve(Location);
          },
        );
      }))),

    deleteLocation: authenticated(
      validateRole('ADMIN')((_root, { id }) => new Promise((resolve, _obj) => {
        Locations.findOneAndDelete({ _id: id }, (err) => {
          if (err) rejects(err);
          else resolve('Your file has been deleted.');
        });
      }))),

    setEvent: authenticated(
      validateRole('ADMIN')((_root, { input }) => {
        const newEvent = new Events({
          title: input.title,
          place: input.place,
          content__en: input.content__en,
          content__zh: input.content__zh,
          imageUrl: input.imageUrl,
          webUrl: input.webUrl,
          lat: input.lat,
          lng: input.lng,
          date: input.date || new Date(),
          email: input.email,
          facebook: input.facebook,
          category: input.category,
          recomendations: input.recomendations
        });
        newEvent.id = newEvent._id;

        return new Promise((resolve, _obj) => {
          newEvent.save((err) => {
            if (err) rejects(err);
            else resolve(newEvent);
          });
        });
      })),

    uploadEvent: authenticated(
      validateRole('ADMIN')((_root, { input }) => new Promise((resolve, _obj) => {
        Events.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (err, Event) => {
            if (err) rejects(err);
            else resolve(Event);
          },
        );
      }))),

    deleteEvent: authenticated(
      validateRole('ADMIN')((_root, { id }) => new Promise((resolve, _obj) => {
        Events.findOneAndDelete({ _id: id }, (err) => {
          if (err) rejects(err);
          else resolve('Your file has been deleted.');
        });
      }))),

    setShop: authenticated(
      validateRole('ADMIN')((_root, { input }) => {
        const newShop = new Shops({
          name: input.name,
          address: input.address,
          phone: input.phone,
          imageUrl: input.imageUrl,
          email: input.email,
          facebook: input.facebook,
          instagram: input.instagram,
          webUrl: input.webUrl,
          lat: input.lat,
          lng: input.lng,
          category: input.category,
          promoded: input.promoded,
          thumbnail: input.thumbnail,
          description: input.description,
          rate: input.rate,
          plasticfree: input.plasticfree

        });
        newShop.id = newShop._id;

        return new Promise((resolve, _obj) => {
          newShop.save((err) => {
            if (err) rejects(err);
            else resolve(newShop);
          });
        });
      })),

    uploadShop: authenticated(
      validateRole('ADMIN')((_root, { input }) => new Promise((resolve, _obj) => {
        Shops.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (err, Shop) => {
            if (err) rejects(err);
            else resolve(Shop);
          },
        );
      }))),

    deleteShop: authenticated(
      validateRole('ADMIN')((_root, { id }) => new Promise((resolve, _obj) => {
        Shops.findOneAndDelete({ _id: id }, (err) => {
          if (err) rejects(err);
          else resolve('Your file has been deleted.');
        });
      }))),

    setAdvice: authenticated(
      validateRole('ADMIN')((_root, { input }) => {
        const newAdvice = new Advices({
          title__en: input.title__en,
          title__zh: input.title__zh,
          statement__en: input.statement__en,
          statement__zh: input.statement__zh,
          author: input.author,
          contentWhy__en: input.contentWhy__en,
          contentWhy__zh: input.contentWhy__zh,
          contentWhat__en: input.contentWhat__en,
          contentWhat__zh: input.contentWhat__zh,
          contentHow__en: input.contentHow__en,
          contentHow__zh: input.contentHow__zh,
          imageUrlWhy: input.imageUrlWhy,
          authorWhy: input.authorWhy,
          linkWhy: input.linkWhy,
          imageUrlWhat: input.imageUrlWhat,
          authorWhat: input.authorWhat,
          linkWhat: input.linkWhat,
          date: new Date().toString(),
          products: input.products
        });
        newAdvice.id = newAdvice._id;

        return new Promise((resolve, _obj) => {
          newAdvice.save((err) => {
            if (err) rejects(err);
            else resolve(newAdvice);
          });
        });
      })),

    uploadAdvice: authenticated(
      validateRole('ADMIN')((_root, { input }) => new Promise((resolve, _obj) => {
        Advices.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (err, Advice) => {
            if (err) rejects(err);
            else resolve(Advice);
          },
        );
      }))),

    deleteAdvice: authenticated(
      validateRole('ADMIN')((_root, { id }) => new Promise((resolve, _obj) => {
        Advices.findOneAndDelete({ _id: id }, (err) => {
          if (err) rejects(err);
          else resolve('Your file has been deleted.');
        });
      }))),

    setProduct: authenticated(
      validateRole('ADMIN')((_root, { input }) => {
        const newProduct = new Products({
          name__en: input.name__en,
          name__zh: input.name__zh,
          price: input.price,
          link: input.link,
          newness: input.newness,
          imageUrl: input.imageUrl,
          description__en: input.description__en,
          description__zh: input.description__zh,
          brand: input.brand,
          category: input.category,
        });
        newProduct.id = newProduct._id;

        return new Promise((resolve, _obj) => {
          newProduct.save((err) => {
            if (err) rejects(err);
            else resolve(newProduct);
          });
        });
      })),

    uploadProduct: authenticated(
      validateRole('ADMIN')((_root, { input }) => new Promise((resolve, _obj) => {
        Products.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (err, product) => {
            if (err) rejects(err);
            else resolve(product);
          }
        );
      }))),

    deleteProduct: authenticated(
      validateRole('ADMIN')((_root, { id }) => new Promise((resolve, _obj) => {
        Products.findOneAndDelete({ _id: id }, (err) => {
          if (err) rejects(err);
          else resolve('Your file has been deleted.');
        });
      }))),

    setOrders: authenticated(
      validateRole('ADMIN')((_root, { input }) => {
        const newOrder = new Orders({
          order: input.order,
          total: input.total,
          date: new Date(),
          client: input.client,
          state: 'PENDING',
          seller: input.seller,
        });

        newOrder.id = newOrder._id;

        return new Promise((resolve, _obj) => {
          newOrder.save((err) => {
            if (err) rejects(err);
            else resolve(newOrder);
          });
        });
      })),

    updateOrders: authenticated(
      validateRole('ADMIN')((_root, { input }) => new Promise((resolve, _obj) => {
        // recorrer y actualizar la cantidad de productos con $inc de mongodb
        // es para variar un dato en otra collecion
        // https://docs.mongodb.com/manual/reference/operator/update/inc/index.html
        const { state } = input;
        let instruction;
        if (state === 'COMPLETE') {
          instruction = '-';
        } else if (state === 'CANCELLED') {
          instruction = '+';
        }
        input.order.forEach((order) => {
          Products.updateOne({ _id: order.id },
            {
              $inc:
                { stock: `${instruction}${order.quantity}` }
            }, (error) => {
              if (error) return new Error(error);
            });
        });

        Orders.findOneAndUpdate(
          { _id: input.id },
          input,
          { new: true },
          (err, product) => {
            if (err) rejects(err);
            else resolve(product);
          },
        );
      }))),
    createUser: async (_root, {
      user, name, rol, password,
    }) => {

      const userExit = await Users.findOne({ user });

      if (userExit) {
        throw new Error('This user already exit');
      }

      await new Users({
        user,
        name,
        rol,
        password,
      }).save();
      sendConfirmationEmail(user)
      return 'Create correctly';
    },
    authUser: async (_root, { user, password }) => {
      // check is the user already exit
      const userObj = await Users.findOne({ user });

      if (!userObj) {
        throw new Error('User not find');
      }
      const passwordCorrect = await bcrypt.compare(password, userObj.password);

      if (!passwordCorrect) {
        throw new Error('Password incorrect');
      }

      return {
        token: createToken(userObj, process.env.SECRETO, '24hr'),
      };
    },
    singleUpload: (_obj, { file }) => processUpload(file),
    async multipleUpload(_obj, { files }) {
      const { resolve, reject } = await promisesAll.all(
        files.map(processUpload),
      );

      if (reject.length) {
        reject.forEach(({ name, message }) => console.error(`${name}: ${message}`));
      }

      return resolve;
    },
    createEmailCampaing: async (_, { input }, { dataSources }) => {
      let onCreateEmail = await dataSources.emailAPI.postEmailCampaing(input)
      return `you email ${onCreateEmail.email_address} create correctly`;
    },
  },
  // Advice: {
  //   products: async (parent, args, { }) => {
  //     const newArray = parent.products.map(p => {
  //       console.log(ObjectId(p.id))
  //       return ObjectId(p.id)
  //     })
  //     console.log(newArray)
  //     return await Products.find({
  //       'id': { $in: [newArray] }
  //     });
  //   },
  // },
};


module.exports = { resolvers };
