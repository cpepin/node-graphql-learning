const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');

const { jwtPassword } = require('../constants');

module.exports = {
  Query: {
    allLinks: async (root, data, { mongo: { Links } }) => {
      return await Links.find({}).toArray();
    },
  },

  Mutation: {
    createLink: async (root, data, { mongo: { Links }, user }) => {
      const newLink = Object.assign({ postedById: user && user._id }, data);
      const response = await Links.insert(newLink);
      return Object.assign({ id: response.insertedIds[0] }, newLink);
    },
    createUser: async (root, data, { mongo: { Users } }) => {
      const bcryptedPassword = await bcrypt.hash(data.authProvider.email.password, 5);
      const newUser = {
          name: data.name,
          email: data.authProvider.email.email,
          password: bcryptedPassword,
      };
      const response = await Users.insert(newUser);
      return Object.assign({ id: response.insertedIds[0] }, newUser);
    },
    signinUser: async (root, data, { mongo: { Users } }) => {
      const user = await Users.findOne({ email: data.email.email });
      const doesMatch = await bcrypt.compare(data.email.password, user.password);
      if (doesMatch) {
        return {
          token: jwt.sign({
            email: user.email,
            id: user._id,
            name: user.name
          }, jwtPassword),
          user
        };
      } // Probably should handle the error case
    },
    createVote: async (root, data, { mongo: { Votes }, user }) => {
      const newVote = {
        userId: user && user._id,
        linkId: new ObjectID(data.linkId),
      };
      const response = await Votes.insert(newVote);
      return Object.assign({ id: response.insertedIds[0] }, newVote);
    },
  },

  Link: {
    id: root => root._id || root.id,
    postedBy: async ({ postedById }, data, { mongo: { Users } }) => {
      return await Users.findOne({ _id: postedById });
    },
  },

  User: {
    id: root => root._id || root.id,
  },

  Vote: {
    id: root => root._id || root.id,

    user: async ({ userId }, data, { mongo: { Users } }) => {
      return await Users.findOne({ _id: userId });
    },

    link: async ({ linkId }, data, { mongo: { Links } }) => {
      return await Links.findOne({ _id: linkId });
    },
  },
};