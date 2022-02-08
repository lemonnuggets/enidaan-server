const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const logger = require("morgan");
const errorHandler = require("errorhandler");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
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
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  console.log("res.locals.user", res.locals.user);
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    !req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)
  ) {
    console.log("req.path 1", req.path);
    req.session.returnTo = req.originalUrl;
  } else if (
    req.user &&
    (req.path === "/account" || req.path.match(/^\/api/))
  ) {
    console.log("req.path 2", req.path);
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use(
  "/",
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

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
