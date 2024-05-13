const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const corsConfig = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
};
app.use(cors(corsConfig));
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dmdmzzd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const addQueryCollection = client.db("APIS").collection("queries");
    const recommendationCollection = client
      .db("APIS")
      .collection("recommendation");

    // Adding   Quieries
    app.post("/queries", async (req, res) => {
      const addQuery = req.body;
      const result = await addQueryCollection.insertOne(addQuery);
      res.send(result);
    });

    app.get("/queries", async (req, res) => {
      const cursor = addQueryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/queries", async (req, res) => {
      const cursor = addQueryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/queries/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addQueryCollection.findOne();
      res.send(result);
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      //const query = { _id: new ObjectId(id) };
      //const result = await placeCollection.findOne();
      const result = await addQueryCollection.findOne({
        _id: new ObjectId(id),
      });
      console.log(result);
      res.send(result);
    });

    app.put("/updateQuery/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedQuery = req.body;
      console.log(updatedQuery);
      const place = {
        $set: {
          product_name: updatedQuery.product_name,
          brand_name: updatedQuery.brand_name,
          product_image_url: updatedQuery.product_image_url,
          query_title: updatedQuery.query_title,
          alternation_reason: updatedQuery.alternation_reason,
          posted_date: updatedQuery.posted_date,
        },
      };
      try {
        const result = await addQueryCollection.updateOne(
          filter,
          place,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating place:", error);
        res.status(500).send("Error updating place.");
      }
    });

    app.delete("/queries/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addQueryCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/recommendation", async (req, res) => {
      const recommendationQuery = req.body;
      const result = await recommendationCollection.insertOne(
        recommendationQuery
      );
      res.send(result);
    });

    app.get("/recommendation", async (req, res) => {
      const cursor = recommendationCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //   Recomendation  Operations
    // app.get("/recommendation/:id", async (req, res) => {
    //   const id = req.params.id;
    //   //const query = { _id: new ObjectId(id) };
    //   //const result = await placeCollection.findOne();
    //   const result = await addQueryCollection.findOne({
    //     _id: new ObjectId(id),
    //   });
    //   console.log(result);
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to  APIS");
});

app.listen(port, () => {
  console.log("Serever is running");
});
