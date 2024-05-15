const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// const corsConfig = {
//   origin: [
//     "http://localhost:5173",
//     "http://localhost:5173",
//     "https://apis-511ac.web.app",
//   ],
//   credentials: true,
// };

const corsConfig = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsConfig));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
app.options("*", cors(corsConfig));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dmdmzzd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const addQueryCollection = client.db("APIS").collection("queries");
    const recommendationCollection = client
      .db("APIS")
      .collection("recommendation");
    // JWT Acces Token
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("user from token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    // app.post("/logout", async (res, req) => {
    //   const user = req.body;
    //   console.log("login user out", user);
    //   res.clearCookie("token").send({ success: true });
    // });
    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("login user out", user);
      res.cookie("token", "", { expires: new Date(0) }).send({ success: true });
    });

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

      const result = await addQueryCollection.findOne({
        _id: new ObjectId(id),
      });

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

    app.get("/recommendation", async (req, res) => {
      console.log("cokkieeeeeee", req?.cookies);
      const cursor = recommendationCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/recommendation", async (req, res) => {
      const email = req.url.split("=")[1];
      if (!email) return res.send("Plz provide a user email");
      const cursor = recommendationCollection.find({ use_email: email });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/recommendation", async (req, res) => {
      const recommendationQuery = req.body;
      const result = await recommendationCollection.insertOne(
        recommendationQuery
      );
      res.send(result);
    });

    app.put("/recommendation/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = { $inc: { recomend_count: 1 } };
      try {
        const result = await addQueryCollection.updateOne(filter, update);
        res.send(result);
      } catch (error) {
        console.error("Error updating recomend_count:", error);
        res.status(500).send("Error updating recomend_count.");
      }
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to  APIS");
});

app.listen(port, () => {
  console.log("Serever is running");
});
