const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: String,
    profile: {
      name: String,
      gender: {
        type: String,
        validate: (gender) => {
          if (gender === "M" || gender === "F") return true;
          return false;
        },
      },
      location: String,
      registrationNumber: String,
      bio: {
        type: String,
        default: "",
      },
    },
    dateOfJoining: Date,
    reportCount: {
      type: Number,
      default: 0,
    },
    rating: Number,
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
doctorSchema.pre("save", function save(next) {
  const doctor = this;
  if (!doctor.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(doctor.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      doctor.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating doctor's password.
 */
doctorSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  callback
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    callback(err, isMatch);
  });
};

/**
 * Helper method for getting doctor's gravatar.
 */
doctorSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash("md5").update(this.email).digest("hex");
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
