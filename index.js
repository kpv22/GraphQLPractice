import { ApolloServer, UserInputError, gql } from "apollo-server";
// import { v1 as uuid } from "uuid";
import "./db.js";
import Person from "./models/person.js";
import User from "./models/user.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "Aqui_tu_palabra_secreta_para_generar_tokens";

// const persons = [
//   {
//     name: "Andres",
//     phone: "0123456789",
//     street: "Calle Frontend",
//     city: "Barcelona",
//     id: "3d494650-3463-11e9-bc57-8b80ba54c431",
//   },
//   {
//     name: "Giank",
//     phone: "0444456789",
//     street: "Avenida Fullstack",
//     city: "Mataro",
//     id: "3d494670-3463-11e9-bc57-8b30ba54c431",
//   },
//   {
//     name: "Marlene",
//     street: "Pasaje Testing",
//     city: "Ibizaa",
//     id: "3d494671-3463-11e9-bc57-8b80ba54c431",
//   },
// ];

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type User {
    username: String!
    friends: [Person]!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Address {
    street: String!
    city: String!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    me: User
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
    createUser(username: String!): User
    login(username: String!, password: String!): Token
  }
`;

const resolvers = {
  Query: {
    personCount: () => Person.collection.countDocuments(),
    allPersons: async (root, args) => {
      return Person.find({});
    },
    findPerson: async (root, args) => {
      const { name } = args;
      return Person.findOne({ name });
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },

  Mutation: {
    addPerson: async (root, args) => {
      const person = new Person({ ...args });
      //const {name , phone, street, city}=args
      try {
        await person.save();
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args });
      }
      return person;
    },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name });
      if (!person) return;
      person.phone = args.phone;

      try {
        await person.save();
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args });
      }
      return person;
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username });
      return user.save().catch((error) => {
        throw new UserInputError(error.message, { invalidArgs: args });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      return {
        value: jwt.sign(userForToken, JWT_SECRET),
      };
    },
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer")) {
      const token = auth.substring(7);
      const decodedToken = jwt.verify(token, JWT_SECRET);
      const currentUser = await User.findById(id).populate("friends");
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready ay ${url}`);
});
