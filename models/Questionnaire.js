const mongoose = require("mongoose");

const questionnaireSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responses: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    scans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scan",
      },
    ],
  },
  { timestamps: true }
);

const Questionnaire = mongoose.model("Questionnaire", questionnaireSchema);
module.exports = Questionnaire;
