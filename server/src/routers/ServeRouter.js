const Router = require("express").Router();
const ServeController = require("../controllers/ServeModel");

// Model data for the router
Router.post("/modelPrediction", ServeController.inputdata);

// Export the Router
module.exports = Router;
