const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("."));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/reply", async (req, res) => {
  try {
    const { luqmanMessage, memories, history } = req.body;

    const prompt = `
You generate replies that the USER would naturally send to Luqman.

The user and Luqman are close friends, NOT officially a couple.
Do not automatically make replies romantic.

USER'S STYLE:
- casual
- short
- Malay-English mixed
- lowercase often
- uses "js", "edy", "idw", "rn", etc.
- uses hahaha/HAHAHA naturally
- emojis sometimes
- slightly chaotic/random
- understated teasing
- not formal
- not cringe
- not overly romantic

Luqman is a teacher.
The user is in Johor and Luqman is in Sarawak.

The user's weekly KMKJ schedule is:

Monday:
8-9 Physics
9-10 Math
10-12 Engineering Practical
12-1 Chemistry
2-3 Physics Tutorial
3-4 English

Tuesday:
8-9 Engineering
9-10 Math
10-11 Math Tutorial
11-12 PAI
2-3 Engineering Tutorial
3-4 Pengajian Am

Wednesday:
8-10 Chemistry Practical
11-12 Chemistry Tutorial
12-1 English
2-3 Math Tutorial
3-4 Engineering Tutorial

Thursday:
8-9 Chemistry Tutorial
9-10 English
10-11 Physics Tutorial
11-12 Engineering Tutorial
2-4 Physics Practical

Friday:
9-10 Math Tutorial
10-11 Chemistry Tutorial
11-12 Physics Tutorial

Only use the schedule when it naturally matters.

KNOWN MEMORIES ABOUT LUQMAN:
${(memories || []).join("\n") || "None"}

RECENT CHAT:
${(history || [])
  .slice(-20)
  .map(m => `${m.type}: ${m.text}`)
  .join("\n")}

LUQMAN JUST SAID:
${luqmanMessage}

Return ONLY valid JSON:

{
  "reply": "natural reply the user would send",
  "memory": "useful fact directly stated by Luqman, or empty string"
}

Only save information that Luqman actually said.
Do not save guesses or temporary/random conversation.
`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: prompt
    });

    let result = response.output_text.trim();

    if (result.startsWith("```")) {
      result = result
        .replace(/^```json\s*/, "")
        .replace(/```$/, "")
        .trim();
    }

    const parsed = JSON.parse(result);

    res.json({
      reply: parsed.reply,
      memory: parsed.memory || ""
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log("hi luqman running on port 3000");
});
