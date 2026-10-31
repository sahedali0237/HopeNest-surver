import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let db;
let eventCollection;

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    db = client.db("HopeNest");
    eventCollection = db.collection("data");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

export async function disconnectFromMongoDB() {
  await client.close();
}
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/events", async (req, res) => {
  try {
    const events = await eventCollection.find().toArray();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

await connectToMongoDB();

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
