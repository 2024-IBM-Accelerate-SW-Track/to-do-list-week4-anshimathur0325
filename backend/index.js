const express = require("express"),
       app = express(),
       port = process.env.PORT || 3001,
       cors = require("cors");
const bodyParser = require('body-parser');
const fs = require("fs").promises;
const { MongoClient } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.listen(port, () => console.log("Backend server live on " + port));

let collection;
async function connectToMongoDB() {
  const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    const db = client.db('todoapp');
    collection = db.collection('todos');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}
if (process.env.USE_MONGODB === 'true') {
    connectToMongoDB().catch(err => console.error('Error connecting to MongoDB:', err));
  }
  
  app.get("/", (req, res) => {
    res.send({ message: "Connected to Backend server!" });
  });
  
  app.post("/add/item", addItem)
  
  async function addItem (request, response) {
    try {
        // Converting Javascript object (Task Item) to a JSON string
        const id = request.body.jsonObject.id
        const task = request.body.jsonObject.task
        const curDate = request.body.jsonObject.currentDate
        const dueDate = request.body.jsonObject.dueDate
      const newTask = {
        ID: id,
        Task: task,
        Current_date: curDate,
        Due_date: dueDate
      };
  
      if (process.env.USE_MONGODB === 'true' && collection) {
        await collection.insertOne(newTask);
        console.log('Successfully wrote to MongoDB');
      } else {
        const data = await fs.readFile("database.json");
        const json = JSON.parse(data);
        json.push(newTask);
        await fs.writeFile("database.json", JSON.stringify(json))
        console.log('Successfully wrote to file') 
      }
        response.sendStatus(200)
    } catch (err) {
        console.log("error: ", err)
        response.sendStatus(500)
    }
  }