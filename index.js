import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const port = 5000;

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
connectToMongoDB();

export async function disconnectFromMongoDB() {
  await client.close();
}
