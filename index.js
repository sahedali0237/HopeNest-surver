﻿import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import { MongoClient, ObjectId } from "mongodb";

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

const client = new MongoClient(process.env.MONGODB_URI);

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
      message: "Failed to retrieve events",
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
      .db("HopeNest")
      .collection("data")
      .findOne({ _id: new ObjectId(id) });
    if (!result) return res.status(404).json({ message: "Event not found" });
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve event", error: error.message });
  }
});

app.patch("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Incoming PATCH for ID:", id, "Payload:", req.body);

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid Event ID: ${id}` });
    }

    const { _id, ...updateData } = req.body;

    const db = client.db("HopeNest");
    const collection = db.collection("data");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("Successfully updated document:", id);
    res.json({
      message: "Event updated successfully",
      result,
    });
  } catch (error) {
    console.error("MongoDB update error:", error);
    res.status(500).json({
      message: "Failed to update event",
      error: error.message,
    });
  }
});

app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid Event ID: ${id}` });
    }

    const db = client.db("HopeNest");
    const collection = db.collection("data");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("Successfully deleted document:", id);
    res.json({
      message: "Event deleted successfully",
      result,
    });
  } catch (error) {
    console.error("MongoDB delete error:", error);
    res.status(500).json({
      message: "Failed to delete event",
      error: error.message,
    });
  }
});

app.delete("/events/:id/join", async (req, res) => {
  try {
    const eventId = req.params.id;
    const userEmail = req.query.email || req.body?.email;

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }
    const event = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { joinedUsers: userEmail } },
      { new: true },
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ message: "Removed from joined events" });
  } catch (error) {
    console.error("Delete joined event error:", error);
    return res.status(500).json({ message: "Failed to remove joined event" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server initialized on port ${port}`);
});
export default app;
