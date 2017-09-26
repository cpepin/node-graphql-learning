const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const connectMongo = require('./mongo-connector');
const schema = require('./schema');
const { authenticate } = require('./authentication');
const buildDataLoaders = require('./dataloaders');
const formatError = require('./formatError');

const start = async () => {
  const mongo = await connectMongo();
  var app = express();
  const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users);
    return {
      context: {
        dataloaders: buildDataLoaders(mongo),
        mongo,
        user
      }, // This context object is passed to all resolvers.
      formatError,
      schema,
    };
  };
  const PORT = 3000;
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjU5YjMyYjI1NDdlOGMzMjhjN2FiYTMwMiIsIm5hbWUiOiJKb2hubnkgVGVzdCIsImlhdCI6MTUwNDkxNDQwNX0.RgLs4Q07A5wIJNZL_raf695K78Tr8qU7KkInlB3eVis'`,
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
  }));

  const server = createServer(app);
  server.listen(PORT, () => {
    SubscriptionServer.create(
      { execute, subscribe, schema },
      { server, path: '/subscriptions' },
    );
    console.log(`GraphQL server running on port ${PORT}.`)
  });
};

start();
