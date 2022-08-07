const Router = require("express").Router();
const DatabaseController = require("../controllers/Database");

// Check if user is logged in
Router.get("/check", DatabaseController.check);

// Export the Router
module.exports = Router;
