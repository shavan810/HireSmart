const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../utils/ApiError');

const MAX_RESUME_BYTES = 8 * 1024 * 1024;

let client;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(503, 'AI analysis is not configured. Add GEMINI_API_KEY to backend/.env');
  }
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
};

const downloadResume = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new ApiError(
      502,
      `Could not read your resume file (status ${res.status}). If you use Cloudinary, enable "Allow delivery of PDF and ZIP files" in Settings > Security.`
    );
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_RESUME_BYTES) throw new ApiError(413, 'Resume file is too large to analyze');
  return buffer;
};

const buildPrompt = (job) => `You are an expert technical recruiter and resume coach.
Analyze the attached resume (PDF) and respond with ONE JSON object only (no markdown, no commentary) using exactly this shape:
{
  "score": number 0-100 (overall resume quality: clarity, impact, structure, relevance, ATS-friendliness),
  "summary": string (2-3 sentence overall assessment),
  "strengths": string[] (3-6 items),
  "weaknesses": string[] (3-6 items),
  "detectedSkills": string[] (skills actually present in the resume),
  "missingSkills": string[] (valuable skills commonly expected for this candidate's apparent field that are absent),
  "suggestions": string[] (4-8 concrete, actionable improvements),
  "jobMatch": ${
    job
      ? `{ "score": number 0-100, "matchedSkills": string[], "missingSkills": string[], "verdict": string (1-2 sentences) }`
      : 'null'
  }
}
Be specific and honest. Never invent experience that is not in the resume.
${
  job
    ? `\nCompare the resume against this job and fill "jobMatch":\nTitle: ${job.title}\nExperience level: ${job.experienceLevel}\nRequired skills: ${(job.skills || []).join(', ') || 'n/a'}\nRequirements: ${(job.requirements || []).join('; ') || 'n/a'}\nDescription: ${job.description.slice(0, 1500)}`
    : ''
}`;

const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
const list = (v) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 12) : []);

const parseJson = (text) => {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (_e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new ApiError(502, 'The AI returned an unreadable response. Please try again.');
  }
};

// The API key stays on the server: the browser only ever talks to our own API.
const analyzeResume = async (resumeUrl, job) => {
  const ai = getClient();
  const buffer = await downloadResume(resumeUrl);

  let response;
  try {
    response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: buildPrompt(job) }, { inlineData: { mimeType: 'application/pdf', data: buffer.toString('base64') } }],
        },
      ],
      config: { responseMimeType: 'application/json', temperature: 0.3 },
    });
  } catch (err) {
    console.error('Gemini error:', err.message);
    throw new ApiError(502, 'The AI service is unavailable right now. Please try again shortly.');
  }

  const data = parseJson(response.text);
  const result = {
    score: clamp(data.score),
    summary: String(data.summary || ''),
    strengths: list(data.strengths),
    weaknesses: list(data.weaknesses),
    detectedSkills: list(data.detectedSkills),
    missingSkills: list(data.missingSkills),
    suggestions: list(data.suggestions),
  };
  if (job && data.jobMatch) {
    result.jobMatch = {
      score: clamp(data.jobMatch.score),
      matchedSkills: list(data.jobMatch.matchedSkills),
      missingSkills: list(data.jobMatch.missingSkills),
      verdict: String(data.jobMatch.verdict || ''),
    };
  }
  return result;
};

module.exports = { analyzeResume };
