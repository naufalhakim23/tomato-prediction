const pool = require("../db/db");
class DatabaseController {
  static async check(req, res) {
    try {
      pool.query(
        `SELECT * FROM tomatomodel.datafromfirebase ORDER BY "timeAdded" DESC LIMIT 1`,
        (error, results) => {
          if (error) {
            res.status(500).json({ error: "Internal server error" });
            throw error;
          }
          //Getting data from database
          const { statusPrediction, percentagePrediction, dnnActivation } =
            results.rows[0];
          res.status(200).json({
            statusPrediction,
            percentagePrediction,
            dnnActivation,
          });
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
}
module.exports = DatabaseController;
