const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
var uri = `mongodb://${process.env.USER}:${process.env.PASS}@cluster0-shard-00-00.fk8o9.mongodb.net:27017,cluster0-shard-00-01.fk8o9.mongodb.net:27017,cluster0-shard-00-02.fk8o9.mongodb.net:27017/?ssl=true&replicaSet=atlas-hwpwcj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 });
    const database = client.db('assignment10');
    const campCollection = database.collection('ideas');
    const userCollection = client.db('assignment10').collection('users');

    app.post('/addCamp', async (req, res) => {
      const newCamp = req.body;
      console.log(newCamp);
      const result = await campCollection.insertOne(newCamp);
      res.send(result);
    });

    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('CrowdCube Server');
});

app.listen(port, () => {
  console.log(`CrowdCube server is running on port ${port}`);
});
