const express = require("express");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const logger = require("morgan");
const errorHandler = require("errorhandler");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");

const upload = multer({ dest: path.join(__dirname, "uploads") });

dotenv.config({ path: ".env" });
/**
 * Routes
 */
const userRoutes = require("./routes/user");
const doctorRoutes = require("./routes/doctor");

/**
 * Controllers.
 */
const homeController = require("./controllers/home");
const apiController = require("./controllers/api");
/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log(
    "!!!!MongoDB connection error. Please make sure MongoDB is running.!!!!"
  );
  process.exit();
});
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

/**
 * Express configuration.
 */
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/health", (req, res) => {
  res.send("OK");
});

app.use("/user", userRoutes);
app.use("/doctor", doctorRoutes);

/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/upload", apiController.getFileUpload);
app.post("/api/upload", upload.single("myFile"), apiController.postFileUpload);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Server Error");
  });
}

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  console.log(
    `App is running at http://localhost:${app.get("port")} in ` +
      `${app.get("env")} mode`
  );
  console.log("\tPress CTRL-C to stop\n");
});

module.exports = app;
