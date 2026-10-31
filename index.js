import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const app = express();

// Explicitly allow PATCH, PUT, DELETE methods in CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
const port = 5000;

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

connectToMongoDB().catch(console.error);

app.post("/create-events", async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const db = client.db("HopeNest");
    const collection = db.collection("data");

    const result = await collection.insertOne(req.body);

    res.status(201).json({
      message: "Data saved successfully!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("MongoDB insert error:", error);

    res.status(500).json({
      message: "Failed to save data",
      error: error.message,
    });
  }
});

app.get("/events", async (req, res) => {
  try {
    const db = client.db("HopeNest");
    const collection = db.collection("data");

    const events = await collection.find({}).toArray();

    res.status(200).json(events);
  } catch (error) {
    console.error("MongoDB fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server initialized on port ${port}`);
});
export default app;
