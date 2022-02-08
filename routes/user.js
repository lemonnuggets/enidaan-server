const path = require("path");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const userController = require("../controllers/user");
const userPassportConfig = require("../config/userPassport");
// const questionnaireController = require("../controllers/questionnaire");
// const reportController = require("../controllers/report");
// const reviewController = require("../controllers/review");
// const scanController = require("../controllers/scan");

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
    key: "user.sid",
  })
);
router.use(passport.initialize());
router.use(passport.session());
router.use((req, res, next) => {
  res.locals.user = req.user;
  console.log("res.locals.user", res.locals.user);
  next();
});
router.use(
  "/",
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

router.get("/", (req, res) => {
  res.send("index");
});
router.post("/signup", userController.postSignup);
router.post("/login", userController.postLogin);
router.get("/logout", userController.logout);
router.get(
  "/account",
  userPassportConfig.isAuthenticated,
  userController.getAccount
);
router.post(
  "/account/profile",
  userPassportConfig.isAuthenticated,
  userController.postUpdateProfile
);
router.post(
  "/account/password",
  userPassportConfig.isAuthenticated,
  userController.postUpdatePassword
);
router.post(
  "/account/delete",
  userPassportConfig.isAuthenticated,
  userController.postDeleteAccount
);

// router.post(
//   "/questionnaire/create",
//   userPassportConfig.isAuthenticated,
//   questionnaireController.postCreate
// );
// router.post(
//   "/questionnaire/update",
//   userPassportConfig.isAuthenticated,
//   questionnaireController.postUpdate
// );
// router.post(
//   "/questionnaire/delete",
//   userPassportConfig.isAuthenticated,
//   questionnaireController.postDelete
// );

// router.post(
//   "/upload",
//   userPassportConfig.isAuthenticated,
//   scanController.postCreate
// );

// router.post(
//   "/report/request",
//   userPassportConfig.isAuthenticated,
//   reportController.postCreate
// );

// router.post(
//   "/review/create",
//   userPassportConfig.isAuthenticated,
//   reviewController.postCreate
// );
// router.post(
//   "/review/update",
//   userPassportConfig.isAuthenticated,
//   reviewController.postUpdate
// );
// router.post(
//   "/review/delete",
//   userPassportConfig.isAuthenticated,
//   reviewController.postDelete
// );

module.exports = router;
