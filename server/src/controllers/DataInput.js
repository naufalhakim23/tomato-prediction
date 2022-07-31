const { ref, onValue } = require("firebase/database");
const pool = require("../db/db");
const db = require("../firebase/Firebase");
const uuid = require("uuid").v4;

class DataInputController {
  static inputdata(req, res) {
    try {
      const getDataInterfaceFirebase = async () => {
        const dataRTDB = ref(db, "node/interface/");
        onValue(dataRTDB, (snapshot) => {
          const data = snapshot.val();
          const {
            percentageSoilSensor2,
            roomHumidity,
            roomTemperature,
            status,
          } = data;
          //send data to database
          pool.query(
            "INSERT INTO tomatomodel.datafromfirebase (id, percentageSoilSensor2, roomHumidity, roomTemperature, status) VALUES ($1, $2, $3, $4, $5)",
            [
              uuid(),
              percentageSoilSensor2,
              roomHumidity,
              roomTemperature,
              status,
            ],
            (error, results) => {
              if (error) {
                throw error;
              }
              res.status(200).json(results.rows);
            }
          );
        });
      };
      getDataInterfaceFirebase();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
module.exports = DataInputController;
