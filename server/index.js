const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3100;

const pool = require("./src/db/db");
const db = require("./src/firebase/Firebase");
const uuid = require("uuid").v4;

//tensorflow
const tf = require("@tensorflow/tfjs");
const tfn = require("@tensorflow/tfjs-node");
//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Router Data
const DatabaseRouter = require("./src/routers/DatabaseRouter");

//Router
app.use("/api", DatabaseRouter);

const reference = db.ref("node/interface/");
reference.on("value", (snapshot) => {
  const data = snapshot.val();
  const {
    percentageSoilSensor2,
    roomHumidity,
    roomTemperature,
    status,
    dnnActivation,
  } = data;
  //send data to database
  pool.query(
    `INSERT INTO tomatomodel.datafromfirebase ("id", "percentageSoilSensor2", "roomHumidity", "roomTemperature", "status", "timeAdded", "dnnActivation") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      uuid(),
      percentageSoilSensor2,
      roomHumidity,
      roomTemperature,
      status,
      new Date(),
      dnnActivation,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      console.log("Data added to database");
    }
  );
  // Deploying json machine learning model fetching data from postgresql database
  // predicting data from tensorflow model
  const handler = tfn.io.fileSystem("./src/tfjs/model.json");
  const model = tf.loadGraphModel(handler);
  pool.query(
    `SELECT * FROM tomatomodel.datafromfirebase ORDER BY "timeAdded" DESC LIMIT 1`,
    (error, results) => {
      if (error) {
        throw error;
      }
      //Getting data from database
      const {
        percentageSoilSensor2,
        roomHumidity,
        roomTemperature,
        dnnActivation,
      } = results.rows[0];
      //converting data to tensor
      let dataConversionTensor = {
        percentagesoilsensor2: tf.tensor([[parseFloat(percentageSoilSensor2)]]),
        roomhumidity: tf.tensor([[parseFloat(roomHumidity)]]),
        roomtemperature: tf.tensor([[parseFloat(roomTemperature)]]),
      };
      //predicting data
      const prediction = model.then(
        (res) => {
          const resPred = res.predict(dataConversionTensor);
          const data = resPred.dataSync();
          return data;
        },
        (err) => {
          console.log(err);
        }
      );
      const viewDataAsync = async () => {
        try {
          const dataPrediction = await prediction;
          return dataPrediction[0];
        } catch (err) {
          console.log(err);
        }
      };
      //Getting prediction from tensorflow model and sending it to postgresql database
      const predictionTensorflow = viewDataAsync().then((res) => {
        const predictionRoundedMath = Math.round(res);
        if (dnnActivation === 1) {
          db.ref("node/interface/").update({
            status: predictionRoundedMath,
          });
        } else {
          console.log("DNN is not activated");
        }
        pool.query(
          `INSERT INTO tomatomodel.datafromfirebase ("id", "percentageSoilSensor2", "roomHumidity", "roomTemperature", "status", "statusPrediction", "timeAdded", "percentagePrediction", "dnnActivation") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            uuid(),
            percentageSoilSensor2,
            roomHumidity,
            roomTemperature,
            status,
            predictionRoundedMath,
            new Date(),
            res,
            dnnActivation,
          ],
          (error, results) => {
            if (error) {
              throw error;
            }
            console.log("Prediction & Data added to database");
          }
        );
      });
      predictionTensorflow;
    }
  );
});
//listening to port
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
