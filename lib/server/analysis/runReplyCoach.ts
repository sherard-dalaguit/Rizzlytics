import { openai } from "@/lib/server/openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { ITranscriptMessage } from "@/database/conversation-snapshot.model";

export const ReplyCoachOutputSchema = z.object({
  situationRead: z.string().min(1),
  momentum: z.enum(["building", "stalling", "dying", "strong"]),
  replies: z.array(
    z.object({
      text: z.string().min(1),
      tone: z.enum(["playful", "direct", "curious", "grounded"]),
      intent: z.enum(["re-engage", "escalate", "clarify", "disengage"]),
      why: z.string().min(1),
    })
  ).min(4).max(6),
});

export type ReplyCoachOutput = z.infer<typeof ReplyCoachOutputSchema>;

const systemPrompt = `
  You are a live conversation coach for dating apps.

  The user is in an active conversation and needs reply options RIGHT NOW.

  Your output has three parts:

  ────────────────────────
  1. SITUATION READ (2 sentences max)
  ────────────────────────
  Name what is happening in this conversation right now.
  Where is it in the arc? What is the key dynamic between the two people?
  Be direct and specific. No fluff. No advice here — just the read.

  ────────────────────────
  2. MOMENTUM
  ────────────────────────
  - building: conversation is gaining warmth and interest from both sides
  - stalling: replies are getting shorter or slower but interest is still present
  - dying: interest is dropping, the energy is mostly one-sided
  - strong: clear mutual investment, the conversation is moving toward a date or deeper connection

  ────────────────────────
  3. REPLIES (4–6 options)
  ────────────────────────
  Each reply is a message the user can copy and send immediately.

  VOICE RULES:
  - Sound like messages a real person would send — not a coach or a script
  - Casual, warm, slightly flirty when appropriate, unforced
  - Target 6–18 words
  - Usually 1 sentence (2 max if logistics require it)
  - Match the energy and length of the other person's last message
  - Lowercase is fine. One emoji max, optional.
  - No explanations, no coaching language inside the reply text itself

  COVERAGE: Replies should span different intents and tones so the user has real options.
  Include at least one playful and one more direct option.

  WHY RULE (very important):
  Each reply must include a 1-sentence "why" explaining what that specific reply does in this conversation.
  Be specific to what is happening in this conversation — not generic.
  Good: "Mirrors her callback to the beach comment and signals you noticed the detail"
  Bad: "This is an engaging response"

  ────────────────────────
  TONE RULE
  ────────────────────────
  No moralizing. No lecturing. Judge only by what will keep the conversation alive and move it forward.

  ────────────────────────
  ABSOLUTE OUTPUT RULES
  ────────────────────────
  - Output MUST be valid JSON matching the schema exactly.
  - Do NOT include markdown, commentary, or extra keys.
  - Return ONLY the JSON object.
`.trim();

const runReplyCoach = async (args: {
  transcript: ITranscriptMessage[];
  contextInput?: string;
  otherProfileContext?: string;
}): Promise<ReplyCoachOutput> => {
  const payload = {
    transcript: args.transcript ?? [],
    contextInput: args.contextInput ?? null,
    otherProfileContext: args.otherProfileContext ?? null,
  };

  const response = await openai.responses.create({
    model: "gpt-5",
    instructions: systemPrompt,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `CONVERSATION_DATA:\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
      },
    ],
    text: { format: zodTextFormat(ReplyCoachOutputSchema, "reply_coach_output") },
  });

  const raw = response.output_text;
  if (!raw) throw new Error("Empty model output");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`Model did not return valid JSON: ${raw.slice(0, 200)}`);
  }

  return ReplyCoachOutputSchema.parse(json);
};

export default runReplyCoach;