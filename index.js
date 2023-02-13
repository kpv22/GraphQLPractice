import { ApolloServer, UserInputError, gql } from "apollo-server";
import { v1 as uuid } from "uuid";
import axios from "axios";

const persons = [
  {
    name: "kevin",
    phone: "0123456789",
    street: "Calle Frontend",
    city: "Barcelona",
    id: "3d494650-3463-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Youssef",
    phone: "0444456789",
    street: "Avenida Fullstack",
    city: "Mataro",
    id: "3d494670-3463-11e9-bc57-8b30ba54c431",
  },
  {
    name: "Itzi",
    street: "Pasaje Testing",
    city: "Ibizaa",
    id: "3d494671-3463-11e9-bc57-8b80ba54c431",
  },
];

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

  type Address {
    street: String!
    city: String!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: async (root, args) => {
      const { data: personsFromRestApi } = await axios.get(
        "http://localhost:3000/persons"
      );

      if (!args.phone) return personsFromRestApi;

      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;
      return personsFromRestApi.filter(byPhone);
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },

  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => (p.name = args.name))) {
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });
      }
      //const {name , phone, street, city}=args
      const person = { ...args, id: uuid() };
      persons.push(person); // update database with new person
      return person;
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if (personIndex === -1) return null;

      const person = persons[personIndex];
      const updatedPerson = { ...person, phone: args.phone };
      persons[personIndex] = updatedPerson;
      return updatedPerson;
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
});

server.listen().then(({ url }) => {
  console.log(`Server ready ay ${url}`);
});
