import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import { MongoClient } from "mongodb";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
const port = 5000;

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017");

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
    const result = await collection.find().toArray();
    res.json(result);
  } catch (error) {
    console.error("MongoDB query error:", error);
    res.status(500).json({
      message: "Failed to retrieve destinations",
      error: error.message,
    });
  }
});

app.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Event ID format" });
    }
    const result = await client
      .db("yourDB")
      .collection("events")
      .findOne({ _id: new ObjectId(id) });
    if (!result) return res.status(404).json({ message: "Event not found" });
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve event", error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server initialized on port ${port}`);
});
export default app;
