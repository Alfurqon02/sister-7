const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const path = require('path');
const fs = require('fs');

// ANCHOR JSON data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// ANCHOR Initialize data store
function initializeData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 }
      ],
      nextId: 3
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// ANCHOR Read data from JSON file
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { users: [], nextId: 1 };
  }
}

// ANCHOR Write data to JSON file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data file:', error);
  }
}

// ANCHOR Initialize data on startup
initializeData();

// ANCHOR Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int!
  }

  input UserInput {
    name: String!
    email: String!
    age: Int!
  }

  input UpdateUserInput {
    name: String
    email: String
    age: Int
  }

  type Query {
    hello: String
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User
    deleteUser(id: ID!): Boolean!
  }
`);

// SECTION Root
const root = {
  hello: () => {
    return 'Hello world!';
  },
  
  // ANCHOR Queries
  users: () => {
    const data = readData();
    return data.users;
  },
  
  user: ({ id }) => {
    const data = readData();
    return data.users.find(user => user.id == id);
  },
  
  // ANCHOR Mutations
  createUser: ({ input }) => {
    const data = readData();
    const newUser = {
      id: data.nextId,
      name: input.name,
      email: input.email,
      age: input.age
    };
    
    data.users.push(newUser);
    data.nextId++;
    writeData(data);
    
    return newUser;
  },
  
  updateUser: ({ id, input }) => {
    const data = readData();
    const userIndex = data.users.findIndex(user => user.id == id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    
    // Update only provided fields
    if (input.name !== undefined) data.users[userIndex].name = input.name;
    if (input.email !== undefined) data.users[userIndex].email = input.email;
    if (input.age !== undefined) data.users[userIndex].age = input.age;
    
    writeData(data);
    return data.users[userIndex];
  },
  
  deleteUser: ({ id }) => {
    const data = readData();
    const userIndex = data.users.findIndex(user => user.id == id);
    if (userIndex === -1) {
      return false;
    }
    
    data.users.splice(userIndex, 1);
    writeData(data);
    return true;
  }
};
// !SECTION
const app = express();

// ANCHOR Serve static files for the client
app.use(express.static('public'));

// ANCHOR GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// ANCHOR Serve
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(4000);