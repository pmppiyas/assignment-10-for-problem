const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb://${process.env.USER}:${process.env.PASS}@cluster0-shard-00-00.fk8o9.mongodb.net:27017,cluster0-shard-00-01.fk8o9.mongodb.net:27017,cluster0-shard-00-02.fk8o9.mongodb.net:27017/?ssl=true&replicaSet=atlas-hwpwcj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {


    const database = client.db('assignment10');
    const campCollection = database.collection('ideas');
    const userCollection = database.collection('users');

    const campaigns = await campCollection.find().toArray();
    for (const campaign of campaigns) {
      if (typeof campaign.deadline === 'string') {
        await campCollection.updateOne(
          { _id: campaign._id },
          { $set: { deadline: new Date(campaign.deadline) } }
        );
      }
    }

    // Add New Campaign
    app.post('/addCamp', async (req, res) => {
      const newCamp = req.body;
      console.log('New Campaign:', newCamp);
      const result = await campCollection.insertOne(newCamp);
      res.status(201).send(result);
    });

    // Get All Campaigns
    app.get('/campaigns', async (req, res) => {
      const result = await campCollection.find().toArray();
      res.status(200).send(result);
    });

    // Get Campaign by ID
    app.get('/campaigns/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await campCollection.findOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).send({ error: 'Failed to fetch campaign.' });
      }
    });

    // Get My Campaigns by Email
    app.get('/myCampaign/:email', async (req, res) => {
      const email = req.params.email;
      const result = await campCollection.find({ userEmail: email }).toArray();
      res.status(200).send(result);
    });

    /// Get Running Campaigns
    app.get('/runningCamps', async (req, res) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const query = { deadline: { $gte: today } };
      try {
        const runningCamps = await campCollection
          .find(query)
          .limit(6)
          .toArray();
        console.log('Running Campaigns:', runningCamps);
        res.status(200).send(runningCamps);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching running campaigns' });
      }
    });

    // Delete Campaign
    app.delete('/myCampaign/:email/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.deleteOne(query);
      res.status(200).send(result);
    });

    // Update Campaign
    app.patch('/updateCampaign/:id', async (req, res) => {
      const id = req.params.id;
      const updateCamp = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDocument = {
        $set: {
          title: updateCamp.title,
          type: updateCamp.type,
          description: updateCamp.description,
          minDonation: updateCamp.minDonation,
          deadline: new Date(updateCamp.deadline),
          photoURL: updateCamp.photoURL,
        },
      };
      const result = await campCollection.updateOne(query, updateDocument);
      console.log(
        'Updated Campaign Deadline Type:',
        typeof updateCamp.deadline
      );
      res.status(200).send(result);
    });

    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);

// Home point
app.get('/', (req, res) => {
  res.send('CrowdCube Server');
});

// Start Server
app.listen(port, () => {
  console.log(`CrowdCube server is running on port ${port}`);
});
