const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3100;
// Router data
const ServeRouter = require("./src/routers/ServeRouter");
const NewDataInputRouter = require("./src/routers/NewDataInputRouter");

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Router
app.use("/api", ServeRouter);
app.use("/api", NewDataInputRouter);

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
