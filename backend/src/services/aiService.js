const axios = require("axios");
const env = require("../config/env");
const HttpError = require("../utils/httpError");

async function generateShortlistSummary(student, recommendations) {
  if (!env.openRouterApiKey) {
    throw new HttpError(
      503,
      "AI features are not configured."
    );
  }

  const prompt = `
You are an experienced international education counselor.

Student Profile:
Name: ${student.fullName}
Target Countries: ${student.targetCountries.join(", ")}
Interested Fields: ${student.interestedFields.join(", ")}
Preferred Intake: ${student.preferredIntake}
Budget (USD): ${student.maxBudgetUsd}
IELTS Score: ${student.englishTest?.score || 0}

Recommended Programs:
${recommendations
  .map(
    (program, index) => `
${index + 1}. ${program.title}
University: ${program.universityName}
Country: ${program.country}
Tuition: ${program.tuitionFeeUsd}
Match Score: ${program.matchScore}
`
  )
  .join("\n")}

Return ONLY valid JSON in the following format:

{
  "shortlistSummary": "string",
  "recommendations": [
    {
      "program": "string",
      "reason": "string"
    }
  ],
  "profileWeaknesses": [
    "string"
  ],
  "nextSteps": [
    "string"
  ]
}

Rules:
- Do not return markdown.
- Do not use code fences.
- Return valid JSON only.
- Keep the response concise and professional.
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",

        response_format: {
          type: "json_object",
        },

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${env.openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Waygood Assignment",
        },
      }
    );

    const content =
      response.data.choices[0].message.content;

    return JSON.parse(content);
  } catch (error) {
    console.log("OPENROUTER ERROR:");
    console.log(error.response?.data);

    throw new HttpError(
      502,
      error.response?.data?.error?.message ||
        "Failed to generate AI summary."
    );
  }
}

module.exports = {
  generateShortlistSummary,
};