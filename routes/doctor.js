const express = require("express");
// const doctorController = require("../controllers/doctor");
// const doctorPassportConfig = require("../config/doctorPassport");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("index");
});
// router.post("/signup", doctorController.postSignup);
// router.post("/login", doctorController.postLogin);
// router.get("/logout", doctorController.logout);
// router.get(
//   "/account",
//   doctorPassportConfig.isAuthenticated,
//   doctorController.getAccount
// );
// router.post(
//   "/account/profile",
//   doctorPassportConfig.isAuthenticated,
//   doctorController.postUpdateProfile
// );
// router.post(
//   "/account/password",
//   doctorPassportConfig.isAuthenticated,
//   doctorController.postUpdatePassword
// );
// router.post(
//   "/account/delete",
//   doctorPassportConfig.isAuthenticated,
//   doctorController.postDeleteAccount
// );

// router.post("/report/update", reportController.postUpdate);

module.exports = router;
