import {openai} from "@/lib/server/openai";
import { z } from "zod";
import {zodTextFormat} from "openai/helpers/zod";
import {ITranscriptMessage} from "@/database/conversation-snapshot.model";

type ResponsesContentBlock =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string; detail: "auto" | "low" | "high" };

type ResponsesUserMessage = {
  role: "user";
  content: ResponsesContentBlock[];
}

export const AnalysisOutputSchema = z.object({
  summary: z.string().min(1),

  strengths: z.array(z.string().min(1)),
  weaknesses: z.array(z.string().min(1)),
  attractionSignals: z.object({
    positive: z.array(z.string().min(1)),
    negative: z.array(z.string().min(1)),
    uncertain: z.array(z.string().min(1)),
  }),

  nextSteps: z.array(z.string().min(1)).min(1),

  rating: z.object({
    overall: z.enum(["poor", "mixed", "good", "strong"]),
    confidence: z.number().min(0).max(1),
  }),

  suggestedReplies: z.array(
    z.object({
      text: z.string().min(1),
      tone: z.enum(["playful", "direct", "curious", "grounded"]),
      intent: z.enum(["re-engage", "escalate", "clarify", "disengage"]),
    })
  ),

  warnings: z.array(z.string().min(1)),
});

export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;


const runAIReview = async (args:
  | { type: "photo"; photoUrl: string }
  | {
      type: "conversation";
      transcript: ITranscriptMessage[];
      contextInput?: string;
      otherProfileContext?: string;
    }
): Promise<AnalysisOutput> => {
  const systemPrompt = `
    You are an analysis engine that produces structured dating / social messaging feedback.
    
    INPUTS YOU MAY RECEIVE:
    - conversationSnapshot: A transcript-like snapshot of a conversation. It may include message texts, optional context, and information about the matched partner.
    - mediaAsset: A single photo or media description.
    
    OUTPUT REQUIREMENTS (ABSOLUTE):
    - Output MUST be valid JSON and MUST match the provided schema exactly.
    - Do NOT output markdown, code fences, commentary, or extra keys.
    - Always return ALL required fields, even if some are empty arrays.
    - Never invent facts not supported by the input. If data is missing, say so in "warnings" and use "uncertain" signals.
    - The "summary" is a diagnostic overview, not a teaser. It should be 3–6 sentences and explicitly cover:
      (1) the dominant impression,
      (2) the primary strength that helps attraction,
      (3) the primary weakness that limits attraction,
      (4) who this performs well for vs poorly for,
      (5) whether it should be kept, improved, or replaced.
    - Make strengths/weaknesses specific and grounded in the input.
    - Every strength/weakness/nextStep must include: (a) what you observe, and (b) the improvement lever. Avoid vague adjectives.
    - INFORMATION DENSITY REQUIREMENT: Each item in strengths/weaknesses/attractionSignals/nextSteps must be 18–40 words and contain at least 2 clauses (use semicolons or parentheses if needed).
    - No low-signal bullets like "shows confidence" or "good lighting" unless you add the *mechanism* (what causes that impression) and a *specific change* (what to do differently).
    - Use concrete language: name the exact issue and the lever (camera height, crop, background clutter, facial visibility, opener style, response latency, etc.).
    - "confidence" must be a number between 0 and 1 inclusive.
    - "overall" must be one of: poor, mixed, good, strong.
    - "suggestedReplies" must be realistic and usable as messages. Keep each under 240 characters.
    - Tones: playful, direct, curious, grounded. Intents: re-engage, escalate, clarify, disengage.
    - IMPORTANT: If transcript is missing/empty, suggestedReplies MUST be [].
    
    ${args.type === "photo" ? `
      PHOTO MODE (self dating photo review):
      Your job is to produce *high-signal, specific* feedback and a concrete action plan.
      
      RULES (VERY IMPORTANT):
      - No generic filler like "good lighting" or "nice photo" unless you also say *why* (what you see) and *how to improve it*.
      - Each bullet must reference a concrete observable detail (e.g., mirror selfie, gym background clutter, camera angle, cropping, facial expression visibility).
      - Provide tradeoffs: what this photo signals to some people vs what it might turn off for others.
      - Be direct and specific. If something is mid, say it’s mid and explain how to fix it.
      
      MINIMUM DEPTH REQUIREMENTS:
      - strengths: exactly 4–6 bullets
      - weaknesses: exactly 4–6 bullets
      - attractionSignals:
        - positive: 3–5 bullets
        - negative: 2–4 bullets
        - uncertain: 2–4 bullets
      - nextSteps: 6–10 bullets (action plan; prioritize highest ROI first)
      - warnings: include warnings only when you truly lack info; otherwise [].
      - suggestedReplies MUST be [].
      
      PHOTO REVIEW RUBRIC (use this to generate concrete bullets):
      1) First Impression (0.5 sec): what vibe does this convey?
      2) Face Visibility: can you clearly see eyes/face? if not, note it.
      3) Body Language: posture, openness, confidence vs guardedness.
      4) Context & Story: what does the setting say about lifestyle? is it interesting or cliché?
      5) Composition: crop, distance, angle, lens distortion, mirror selfie penalties.
      6) Lighting: direction, harshness, shadows on face, highlights, color cast.
      7) Background: clutter, distractions, mess, brand logos, other people.
      8) Style/Grooming: outfit fit, cleanliness, intentionality.
      9) Uniqueness: does this stand out? if not, propose a better concept.
      10) Fit for purpose: which slot does this photo belong in? (main photo vs 2nd/3rd)
      
      ACTION PLAN FORMAT (put these into nextSteps bullets):
      - Give retake instructions with specifics: location, time of day, camera position, framing, pose, expression, outfit, and what to avoid.
      - Include 2–3 alternative photo concepts that would outperform this one (e.g., candid outdoor, social proof, hobby/action shot).
      - If this photo should be kept, say which position (e.g., 3rd photo) and why.
      
      OUTPUT:
      - Still obey the JSON schema exactly.
    ` : `
      CONVERSATION MODE (message thread review):
      Your job is to produce *high-signal, specific* feedback and a concrete action plan for what to do next.
      
      RULES (VERY IMPORTANT):
      - Do NOT give generic advice like "ask more questions" unless you cite *where* the issue appears and provide a better replacement line.
      - Every bullet must reference a concrete transcript detail (quote or paraphrase a specific message/turn).
      - Do not invent context. If something matters but is missing (e.g., who sent the last message, whether they replied), add a warning and mark signals as uncertain.
      - Avoid manipulation: no guilt, pressure, dishonesty, or “negging”. Keep it respectful and authentic.
      
      MINIMUM DEPTH REQUIREMENTS:
      - strengths: 4–6 bullets
      - weaknesses: 4–6 bullets
      - attractionSignals:
        - positive: 3–6 bullets
        - negative: 2–5 bullets
        - uncertain: 2–5 bullets
      - nextSteps: 6–10 bullets (prioritized action plan)
      - suggestedReplies:
        - If transcript is missing/empty → MUST be [].
        - Otherwise → provide 4–8 replies, each tailored to the *current state*.
      - warnings: [] unless missing info materially limits analysis.
      
      ANALYSIS STRUCTURE (use this rubric to generate specific bullets):
      1) Conversation stage: opener → rapport → vibe/banter → logistics → date plan (identify where it currently is).
      2) Momentum & reciprocity: who is investing more? are responses getting shorter/longer? delays implied?
      3) Tone alignment: playful vs serious vs dry; does your tone match theirs?
      4) Question/statement mix: are you interrogating, or are you offering hooks (stories, opinions, teasing)?
      5) Flirt calibration: is there light playful tension, or is it purely transactional?
      6) Topic quality: are topics high-energy (shared interests, stories) or low-energy (small talk loops)?
      7) Escalation readiness: do you have enough rapport to propose a date/number? if yes, say exactly how.
      8) Friction points: anything that could read as needy, overly long, interview-y, abrupt, or low effort?
      
      OUTPUT QUALITY REQUIREMENTS:
      - Be diagnostic: state the *pattern*, then the *impact*, then the *fix*.
        Example format for a weakness bullet:
        - "Pattern: ___ (where it occurs). Impact: ___. Fix: ___ (exact replacement line or move)."
      - nextSteps must be a prioritized checklist: Highest ROI first, with exact wording suggestions.
      
      SUGGESTED REPLIES REQUIREMENTS:
      - Each reply MUST map to one of these intents: re-engage, escalate, clarify, disengage.
      - Include variety:
        - 2 re-engage (light + playful)
        - 2 escalate (date/number plan variants)
        - 1 clarify (when ambiguity exists)
        - 1 disengage (graceful exit) if needed
      - Replies must be grounded in the transcript topics. If topic context is unclear, use a neutral but specific prompt that invites a story.
      - If the last message was sent by the user and there is no reply yet, suggestedReplies should focus on *re-engagement* (not double-texting aggressively).
      
      IMPORTANT EDGE CASES:
      - If the match gives short/one-word answers repeatedly, call it out and suggest a pivot or graceful exit.
      - If the conversation is already dead (long gap + no reciprocity), lower confidence and include disengage options.
    `}
          
    CONTENT SAFETY / STYLE:
    - No harassment, hate, sexual content involving minors, threats, or doxxing.
    - Avoid manipulative advice. Do not instruct deceit, coercion, or emotional pressure.
    - If the input is too limited to infer attraction, emphasize uncertainty.
    
    When uncertain, produce conservative, helpful guidance and lower confidence.
    
    Return only the JSON object.
  `.trim();

  let userMessage: ResponsesUserMessage;

  if (args.type === "photo") {
    userMessage = {
      role: "user",
      content: [
        { type: "input_text", text: "INPUT_TYPE: photo\nAnalyze this dating profile photo." },
        { type: "input_image", image_url: args.photoUrl, detail: "auto" },
      ],
    };
  } else {
    const payload = {
      inputType: "conversation",
      contextInput: args.contextInput ?? null,
      otherProfileContext: args.otherProfileContext ?? null,
      transcript: args.transcript ?? [],
    };

    userMessage = {
      role: "user",
      content: [
        { type: "input_text", text: `INPUT_JSON:\n${JSON.stringify(payload, null, 2)}` },
      ],
    };
  }

  const response = await openai.responses.create({
    model: "gpt-5",
    instructions: systemPrompt,
    input: [userMessage],
    text: { format: zodTextFormat(AnalysisOutputSchema, "analysis_output") }
  });

  const raw = response.output_text;
  if (!raw) throw new Error("Empty model output");

  let json: unknown;
  try {
    json = JSON.parse(raw)
  } catch (e) {
    throw new Error(`Model did not return valid JSON: ${raw.slice(0, 200)}`);
  }

  return AnalysisOutputSchema.parse(json);
}

export default runAIReview;