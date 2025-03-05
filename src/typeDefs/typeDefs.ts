export const typeDefs = `#graphql
  enum Gender {
    MALE
    FEMALE
    NON_BINARY
    OTHER
  }

  enum Weapon {
    SWORD
    BOW
    STAFF
    DAGGER
    AXE
    GUN
  }

  enum Genre {
    FANTASY
    SCI_FI
    STEAMPUNK
    CYBERPUNK
    HISTORICAL
  }

  type User {
    id: ID!
    email: String!
    avatars: [Avatar!]!
  }

  type Avatar {
    id: ID!
    name: String!
    weapon: Weapon!
    clothes: String!
    hairColor: String!
    facialHair: Boolean!
    gender: Gender!
    genre: Genre!
    imageUrl: String!
    createdAt: String!
    user: User!
  }

  input AvatarInput {
    name: String!
    weapon: Weapon!
    clothes: String!
    hairColor: String!
    facialHair: Boolean!
    gender: Gender!
    genre: Genre!
    imageUrl: String!
    userId: ID!
  }

  type Query {
    getUser(id: ID!): User
    getAvatars(userId: ID!): [Avatar!]!
    getAvatar(id: ID!): Avatar
  }

  type Mutation {
    createUser(email: String!, password: String!): User
    createAvatar(input: AvatarInput!): Avatar
    updateAvatar(id: ID!, input: AvatarInput!): Avatar
    deleteAvatar(id: ID!): Boolean
    login(email: String!, password: String!): User
  }
`;
