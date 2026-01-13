import { model, models, Schema, Types, Document } from "mongoose";

export interface IAnalysis {
  userId: Types.ObjectId;

  type: "photo" | "conversation";
  status: "queued" | "succeeded" | "failed";

  conversationId?: Types.ObjectId;
  selfPhotoAssetId?: Types.ObjectId;

  result: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    attractionSignals: {
      positive: string[];
      negative: string[];
      uncertain: string[];
    }
    nextSteps: string[];
    rating: {
      overall: string;
      confidence: number;
    };
    suggestedReplies?: {
      text: string;
      tone: string;
      intent: string;
    }[]
  }

  error?: {
    code: string;
    message: string;
  }
}

export interface IAnalysisDoc extends IAnalysis, Document {}
const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: { type: String, enum: ["photo", "conversation"], required: true },
    status: { type: String, enum: ["queued", "succeeded", "failed"], required: true },

    conversationId: { type: Schema.Types.ObjectId, ref: "ConversationSnapshot" },
    selfPhotoAssetId: { type: Schema.Types.ObjectId, ref: "MediaAsset" },

    result: {
      summary: { type: String, required: true },
      strengths: { type: [String], required: true },
      weaknesses: { type: [String], required: true },
      attractionSignals: {
        type: {
          positive: { type: [String], required: true },
          negative: { type: [String], required: true },
          uncertain: { type: [String], required: true },
        },
        required: true
      },
      nextSteps: { type: [String], required: true },
      rating: {
        overall: { type: String, enum: ["poor", "mixed", "good", "strong"], required: true },
        confidence: { type: Number, min: 0, max: 1, required: true },
      },
      suggestedReplies: [{
        text: { type: String, required: true },
        tone: { type: String, required: true },
        intent: { type: String, required: true },
      }]
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