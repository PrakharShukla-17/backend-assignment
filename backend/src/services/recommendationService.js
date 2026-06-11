const Program = require("../models/Program");
const Student = require("../models/Student");
const HttpError = require("../utils/httpError");

function calculateScore(student, program) {
  let score = 0;
  const reasons = [];

  if (student.targetCountries.includes(program.country)) {
    score += 35;
    reasons.push(`Preferred country match: ${program.country}`);
  }

  if (
    student.interestedFields.some((field) =>
      program.field.toLowerCase().includes(field.toLowerCase())
    )
  ) {
    score += 30;
    reasons.push(`Field alignment: ${program.field}`);
  }

  if (student.maxBudgetUsd >= program.tuitionFeeUsd) {
    score += 20;
    reasons.push("Within budget range");
  }

  if (student.preferredIntake && program.intakes.includes(student.preferredIntake)) {
    score += 10;
    reasons.push(`Preferred intake available: ${student.preferredIntake}`);
  }

  if ((student.englishTest?.score || 0) >= program.minimumIelts) {
    score += 5;
    reasons.push("English test score meets requirement");
  }

  return {
    score,
    reasons,
  };
}

async function buildProgramRecommendations(studentId) {
  const student = await Student.findById(studentId).lean();

  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  const ieltsScore = student.englishTest?.score || 0;

  const programs = await Program.aggregate([
    {
  $match: {
    country: {
      $in: student.targetCountries
    }
  }
},
    {
      $addFields: {
        countryScore: {
          $cond: [
            { $in: ["$country", student.targetCountries] },
            35,
            0,
          ],
        },
//regex based field score to strict-out the field score process
        fieldScore: {
  $cond: [
    {
      $or: student.interestedFields.map((field) => ({
        $regexMatch: {
          input: {
            $toLower: "$field",
          },
          regex: field.toLowerCase(),
        },
      })),
    },
    30,
    0,
  ],
},

        budgetScore: {
          $cond: [
            {
              $and: [
                { $ne: [student.maxBudgetUsd, null] },
                { $lte: ["$tuitionFeeUsd", student.maxBudgetUsd || 0] },
              ],
            },
            20,
            0,
          ],
        },

        intakeScore: {
          $cond: [
            {
              $and: [
                { $ne: [student.preferredIntake, null] },
                { $in: [student.preferredIntake, "$intakes"] },
              ],
            },
            10,
            0,
          ],
        },

        ieltsScore: {
          $cond: [
            {
              $lte: ["$minimumIelts", ieltsScore],
            },
            5,
            0,
          ],
        },
      },
    },

    {
      $addFields: {
        matchScore: {
          $add: [
            "$countryScore",
            "$fieldScore",
            "$budgetScore",
            "$intakeScore",
            "$ieltsScore",
          ],
        },
      },
    },

    {
      $match: {
        matchScore: { $gt: 0 },
      },
    },

    {
      $sort: {
        matchScore: -1,
      },
    },

    {
      $limit: 5,
    },
  ]);

  const recommendations = programs.map((program) => {
    const reasons = [];

    if (program.countryScore > 0) {
      reasons.push(
        `Preferred country match: ${program.country}`
      );
    }

    if (program.fieldScore > 0) {
      reasons.push(
        `Field alignment: ${program.field}`
      );
    }

    if (program.budgetScore > 0) {
      reasons.push("Within budget range");
    }

    if (program.intakeScore > 0) {
      reasons.push(
        `Preferred intake available: ${student.preferredIntake}`
      );
    }

    if (program.ieltsScore > 0) {
      reasons.push(
        "English test score meets requirement"
      );
    }

    return {
      ...program,
      reasons,
    };
  });

  return {
    data: {
      student: {
        id: student._id,
        fullName: student.fullName,
        targetCountries: student.targetCountries,
        interestedFields: student.interestedFields,
        preferredIntake: student.preferredIntake,
        maxBudgetUsd: student.maxBudgetUsd,
        englishScore: ieltsScore,
      },
      recommendations,
    },
    meta: {
      recommendationCount: recommendations.length,
      implementation: "mongodb-aggregation",
    },
  };
}


module.exports = {
  buildProgramRecommendations,
};
