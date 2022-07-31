const Router = require("express").Router();
const DataInputController = require("../controllers/DataInput");

// Model data for the router
Router.post("/inputData", DataInputController.inputdata);

// Export the Router
module.exports = Router;
