const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');

const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
    postedBy: User
    votes: [Vote!]!
  }

  type User {
    id: ID!
    name: String!
    email: String
  }

  type Vote {
    id: ID!
    user: User!
    link: Link!
  }

  type SigninPayload {
    token: String
    user: User
  }

  type Query {
    allLinks(filter: LinkFilter, skip: Int, first: Int): [Link!]!
  }

  type Mutation {
    createLink(url: String!, description: String!): Link
    createVote(linkId: ID!): Vote
    createUser(name: String!, authProvider: AuthProviderSignupData!): User
    signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
  }

  type Subscription {
    Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
  }

  input LinkSubscriptionFilter {
    mutation_in: [_ModelMutationType!]
  }

  input LinkFilter {
    OR: [LinkFilter!]
    description_contains: String
    url_contains: String
  }

  type LinkSubscriptionPayload {
    mutation: _ModelMutationType!
    node: Link
  }

  enum _ModelMutationType {
    CREATED
    UPDATED
    DELETED
  }

  input AuthProviderSignupData {
    email: AUTH_PROVIDER_EMAIL
  }

  input AUTH_PROVIDER_EMAIL {
    email: String!
    password: String!
  }
`;

module.exports = makeExecutableSchema({ typeDefs, resolvers });
