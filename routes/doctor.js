const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const doctorController = require("../controllers/doctor");
const { doctorPassport, isAuthenticated } = require("../config/doctorPassport");

const router = express.Router();

router.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000, secure: false, path: "/doctor" }, // two weeks in milliseconds
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    key: "doctor.sid",
  })
);
router.use(doctorPassport.initialize({ userProperty: "doctor" }));
router.use(doctorPassport.session());
router.use((req, res, next) => {
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
router.get("/account", isAuthenticated, doctorController.getAccount);
router.post(
  "/account/profile",
  isAuthenticated,
  doctorController.postUpdateProfile
);
router.post(
  "/account/password",
  isAuthenticated,
  doctorController.postUpdatePassword
);
router.post(
  "/account/delete",
  isAuthenticated,
  doctorController.postDeleteAccount
);

// router.post("/report/update", reportController.postUpdate);

module.exports = router;
