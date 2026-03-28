import { model, models, Schema, Types, Document } from "mongoose";

export interface IAnalysis {
  userId: Types.ObjectId;

  type: "photo" | "conversation" | "profile" | "reply_coach";
  status: "queued" | "succeeded" | "failed";

  conversationId?: Types.ObjectId;
  selfPhotoAssetId?: Types.ObjectId;
  profileId?: Types.ObjectId;

  result: {
    // Standard analysis fields (photo / conversation / profile)
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    attractionSignals?: {
      positive: string[];
      negative: string[];
      uncertain: string[];
    };
    nextSteps?: string[];
    // Structured takeaways for conversation type
    takeaways?: {
      title: string;
      why: string;
      category: "tone" | "pacing" | "escalation" | "opener" | "mindset";
    }[];
    rating?: {
      overall: string;
      confidence: number;
    };
    suggestedReplies?: {
      text: string;
      tone: "playful" | "direct" | "curious" | "grounded";
      intent: "re-engage" | "escalate" | "clarify" | "disengage";
    }[];
    // Reply coach fields
    situationRead?: string;
    momentum?: "building" | "stalling" | "dying" | "strong";
    replies?: {
      text: string;
      tone: "playful" | "direct" | "curious" | "grounded";
      intent: "re-engage" | "escalate" | "clarify" | "disengage";
      why: string;
    }[];
  };

  error?: {
    code: string;
    message: string;
  };
}

export interface IAnalysisDoc extends IAnalysis, Document {}
const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: { type: String, enum: ["photo", "conversation", "profile", "reply_coach"], required: true },
    status: { type: String, enum: ["queued", "succeeded", "failed"], required: true },

    conversationId: { type: Schema.Types.ObjectId, ref: "ConversationSnapshot" },
    selfPhotoAssetId: { type: Schema.Types.ObjectId, ref: "MediaAsset" },
    profileId: { type: Schema.Types.ObjectId, ref: "Profile" },

    result: {
      // Standard analysis fields (photo / conversation / profile)
      summary: { type: String },
      strengths: { type: [String] },
      weaknesses: { type: [String] },
      attractionSignals: {
        positive: { type: [String] },
        negative: { type: [String] },
        uncertain: { type: [String] },
      },
      nextSteps: { type: [String] },
      takeaways: [{
        title: { type: String, required: true },
        why: { type: String, required: true },
        category: { type: String, enum: ["tone", "pacing", "escalation", "opener", "mindset"], required: true },
      }],
      rating: {
        overall: { type: String, enum: ["poor", "mixed", "good", "strong"] },
        confidence: { type: Number, min: 0, max: 1 },
      },
      suggestedReplies: [{
        text: { type: String, required: true },
        tone: { type: String, enum: ["playful", "direct", "curious", "grounded"], required: true },
        intent: { type: String, enum: ["re-engage", "escalate", "clarify", "disengage"], required: true },
      }],
      // Reply coach fields
      situationRead: { type: String },
      momentum: { type: String, enum: ["building", "stalling", "dying", "strong"] },
      replies: [{
        text: { type: String, required: true },
        tone: { type: String, enum: ["playful", "direct", "curious", "grounded"], required: true },
        intent: { type: String, enum: ["re-engage", "escalate", "clarify", "disengage"], required: true },
        why: { type: String, required: true },
      }],
    },

    error: {
      code: { type: String },
      message: { type: String },
    }
  },
  { timestamps: true }
)

const Analysis = models?.Analysis || model<IAnalysis>("Analysis", AnalysisSchema);

export default Analysis;