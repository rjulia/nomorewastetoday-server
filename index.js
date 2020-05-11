const express = require('express')
var path = require('path');
//const http = require('http');
//const { RESTDataSource } = require('apollo-datasource-rest');
const { ApolloServer } = require("apollo-server-express");
const { typeDefs } = require('./data/schema');
const { resolvers } = require("./data/resolvers");
const NewsAPI = require("./data/newsAPI")
const EmailCampaingServices = require("./services/EmailCampaingServices")
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config({ path: '.env' });
const { tradeTokenForUser } = require('./helpers/auth-helpers')

const app = express();
//Allow cross - origin
app.use(cors())



const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  dataSources: () => {
    return {
      emailAPI: new EmailCampaingServices(),
      newsAPI: new NewsAPI(),
    }
  },
  context: async ({ req }) => {
    //aqui obtengo el token que mando desde Apollo cliente en operation.setContext
    let currentUser = null;
    let authToken = req.headers['authorization'];
    if (req.headers['origin'] === process.env.APP_CALLBACK_EXTERNAL) {
      return true
    } else {
      if (authToken !== "null") {
        try {
          const currentUser = await tradeTokenForUser(authToken)

          return {
            authToken,
            currentUser
          }
        } catch (err) {
          console.error('Jwt: ' + err)
        }
      }
    }
  }
});


server.applyMiddleware({ app, path: '/graphql' });

if (process.env.NODE_ENV === "production") {
  app.use(express.static('public'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"))
  })
}
const PORT = process.env.PORT || 5000
app.set('port', PORT);
// const httpServer = http.createServer(app);
// server.installSubscriptionHandlers(httpServer);
// httpServer.listen(PORT, () => console.log(`Server started on port ${server.graphqlPath}`));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));