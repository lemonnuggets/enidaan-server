// const _ = require("lodash");
const validator = require("validator");
const passport = require("passport");
const Doctor = require("../models/Doctor");

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("account/login", {
    title: "Login",
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  console.log("postLogin");
  const validationErrors = [];
  if (typeof req.body.email !== "string")
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (typeof req.body.password !== "string")
    validationErrors.push({ msg: "Please enter a valid password." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.status(500).json({
      status: "error",
      message: "Validation error",
      errors: validationErrors,
    });
  }

  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.status(500).json({
      status: "error",
      message: "Validation errors",
      errors: validationErrors,
    });
  }
  console.log("no validation errors", req.body.email, req.body.password);

  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  const authenticate = passport.authenticate(
    "doctor-local",
    (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("errors", info.message);
        return res.status(500).json({
          status: "error",
          message: "Validation errors",
          errors: info.message,
        });
      }
      req.logIn(user, (err) => {
        console.log("log in", user, err);
        if (err) {
          return next(err);
        }
        req.flash("success", { msg: "Success! You are logged in." });
        res.status(200).json({
          status: "success",
          message: "Success! You are logged in.",
        });
      });
    }
  );
  authenticate(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  console.log("req.session", req.session);
  req.logout();
  req.session.destroy((err) => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.status(200).json({
      status: "success",
      message: "Successfully logged out.",
    });
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  const validationErrors = [];
  if (typeof req.body.email !== "string")
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (typeof req.body.password !== "string")
    validationErrors.push({ msg: "Please enter a valid password." });
  if (typeof req.body.confirmPassword !== "string")
    validationErrors.push({ msg: "Please confirm password." });
  if (typeof req.body.name !== "string")
    validationErrors.push({ msg: "Invalid name" });
  if (
    typeof req.body.gender !== "string" ||
    (req.body.gender !== "M" && req.body.gender !== "F")
  )
    validationErrors.push({ msg: "Invalid Gender" });

  if (validationErrors.length === 0) {
    if (!validator.isEmail(req.body.email))
      validationErrors.push({ msg: "Please enter a valid email address." });
    if (!validator.isLength(req.body.password, { min: 8 }))
      validationErrors.push({
        msg: "Password must be at least 8 characters long",
      });
    if (req.body.password !== req.body.confirmPassword)
      validationErrors.push({ msg: "Passwords do not match" });
  }

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.status(500).json({
      status: "error",
      message: "Validation errors",
      errors: validationErrors,
    });
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });
  const user = new Doctor({
    email: req.body.email,
    password: req.body.password,
    profile: {
      name: req.body.name,
      location: req.body.location,
      gender: req.body.gender,
    },
  });

  Doctor.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      req.flash("errors", {
        msg: "Account with that email address already exists.",
      });
      return res.status(500).json({
        status: "error",
        message: "Account with that email address already exists.",
      });
    }
    user.save((err) => {
      if (err) {
        return next(err);
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.status(200).json({
          status: "success",
          message: "Success! You are logged in.",
        });
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user.profile,
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  const validationErrors = [];
  if (typeof req.body.email !== "string")
    validationErrors.push({ msg: "Please enter a valid email address." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.status(500).json({
      status: "error",
      message: "Validation error",
      errors: validationErrors,
    });
  }

  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.status(500).json({
      status: "error",
      message: "Validation errors",
      errors: validationErrors,
    });
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  Doctor.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    if (user.email !== req.body.email) user.emailVerified = false;
    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.location = req.body.location || "";
    user.profile.gender = req.body.gender || "";
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash("errors", {
            msg: "The email address you have entered is already associated with an account.",
          });
          return res.status(500).json({
            status: "error",
            message:
              "The email address you have entered is already associated with an account.",
          });
        }
        return next(err);
      }
      req.flash("success", { msg: "Profile information has been updated." });
      res.status(200).json({
        status: "success",
        message: "Profile information has been updated.",
        user: {
          _id: user._id,
          email: user.email,
          name: user.profile.name,
          location: user.profile.location,
          gender: user.profile.gender,
        },
      });
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.status(500).json({
      status: "error",
      message: "Validation errors",
      errors: validationErrors,
    });
  }

  Doctor.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Password has been changed." });
      res.status(200).json({
        status: "success",
        message: "Password has been changed.",
      });
    });
  });
};

/**
 * POST /account/delete
 * Delete doctor account.
 */
exports.postDeleteAccount = (req, res, next) => {
  Doctor.deleteOne({ _id: req.user.id }, (err) => {
    if (err) {
      return next(err);
    }
    req.logout();
    req.flash("info", { msg: "Your account has been deleted." });
    res.status(200).json({
      status: "success",
      message: "Your account has been deleted.",
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  const validationErrors = [];
  if (!validator.isHexadecimal(req.params.token))
    validationErrors.push({ msg: "Invalid Token.  Please retry." });
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/forgot");
  }

  Doctor.findOne({ passwordResetToken: req.params.token })
    .where("passwordResetExpires")
    .gt(Date.now())
    .exec((err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("errors", {
          msg: "Password reset token is invalid or has expired.",
        });
        return res.redirect("/forgot");
      }
      res.render("account/reset", {
        title: "Password Reset",
      });
    });
};

/**
 * GET /account/verify/:token
 * Verify email address
 */
exports.getVerifyEmailToken = (req, res, next) => {
  if (req.user.emailVerified) {
    req.flash("info", { msg: "The email address has been verified." });
    return res.redirect("/account");
  }

  const validationErrors = [];
  if (req.params.token && !validator.isHexadecimal(req.params.token))
    validationErrors.push({ msg: "Invalid Token.  Please retry." });
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/account");
  }

  if (req.params.token === req.user.emailVerificationToken) {
    Doctor.findOne({ email: req.user.email })
      .then((user) => {
        if (!user) {
          req.flash("errors", {
            msg: "There was an error in loading your profile.",
          });
          return res.redirect("back");
        }
        user.emailVerificationToken = "";
        user.emailVerified = true;
        user = user.save();
        req.flash("info", {
          msg: "Thank you for verifying your email address.",
        });
        return res.redirect("/account");
      })
      .catch((error) => {
        console.log(
          "Error saving the user profile to the database after email verification",
          error
        );
        req.flash("errors", {
          msg: "There was an error when updating your profile.  Please try again later.",
        });
        return res.redirect("/account");
      });
  } else {
    req.flash("errors", {
      msg: "The verification link was invalid, or is for a different account.",
    });
    return res.redirect("/account");
  }
};
