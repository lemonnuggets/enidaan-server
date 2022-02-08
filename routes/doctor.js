const path = require("path");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const doctorController = require("../controllers/doctor");
const doctorPassportConfig = require("../config/doctorPassport");

const router = express.Router();

router.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    key: "doctor.sid",
  })
);
router.use(passport.initialize({ userProperty: "doctor" }));
router.use(passport.session());
router.use((req, res, next) => {
  console.log("req.doctor", req.doctor);
  res.locals.doctor = req.doctor;
  console.log("res.locals.doctor", res.locals.doctor);
  next();
});
router.use(
  "/",
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

router.get("/", (req, res) => {
  res.send("index");
});
router.post("/signup", doctorController.postSignup);
router.post("/login", doctorController.postLogin);
router.get("/logout", doctorController.logout);
router.get(
  "/account",
  doctorPassportConfig.isAuthenticated,
  doctorController.getAccount
);
router.post(
  "/account/profile",
  doctorPassportConfig.isAuthenticated,
  doctorController.postUpdateProfile
);
router.post(
  "/account/password",
  doctorPassportConfig.isAuthenticated,
  doctorController.postUpdatePassword
);
router.post(
  "/account/delete",
  doctorPassportConfig.isAuthenticated,
  doctorController.postDeleteAccount
);

// router.post("/report/update", reportController.postUpdate);

module.exports = router;
