const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3100;

const pool = require("./src/db/db");
const db = require("./src/firebase/Firebase");
const uuid = require("uuid").v4;

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const reference = db.ref("node/interface/");
reference.on("value", (snapshot) => {
  const data = snapshot.val();
  const { percentageSoilSensor2, roomHumidity, roomTemperature, status } = data;
  //send data to database
  pool.query(
    `INSERT INTO tomatomodel.datafromfirebase ("id", "percentageSoilSensor2", "roomHumidity", "roomTemperature", "status", "timeAdded") VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      uuid(),
      percentageSoilSensor2,
      roomHumidity,
      roomTemperature,
      status,
      new Date(),
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      console.log("Data added to database");
    }
  );
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
