const { initializeApp } = require("firebase-admin/app");
var admin = require("firebase-admin");

var serviceAccount = require("../../gardenhaven-c8b48-firebase-adminsdk-6hovl-be8986cf04.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://gardenhaven-c8b48-default-rtdb.asia-southeast1.firebasedatabase.app",
});
const db = admin.database();
module.exports = db;
