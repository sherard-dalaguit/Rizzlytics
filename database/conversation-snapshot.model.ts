import { model, models, Schema, Types, Document} from "mongoose";

export interface ITranscriptMessage {
  order?: number;
  speaker: "user" | "match" | "unknown";
  text: string;
}

export interface IConversationSnapshot {
  userId: Types.ObjectId;

  threadScreenshotAssetIds: Types.ObjectId[];
  otherProfileAssetIds?: Types.ObjectId[];
  contextInput?: string;
  otherProfileContext?: string;

  transcript: ITranscriptMessage[];
  rawExtractedText?: string;

  extraction: {
    status: "queued" | "succeeded" | "failed";
    warnings?: string[];
  }
}

const TranscriptMessageSchema = new Schema<ITranscriptMessage>(
  {
    order: { type: Number },
    speaker: { type: String, enum: ["user", "match", "unknown"], required: true },
    text: { type: String, required: true },
  },
)

export interface IConversationSnapshotDoc extends IConversationSnapshot, Document {}
const ConversationSnapshotSchema = new Schema<IConversationSnapshot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    threadScreenshotAssetIds: { type: [Schema.Types.ObjectId], ref: "MediaAsset", required: true },
    otherProfileAssetIds: { type: [Schema.Types.ObjectId], ref: "MediaAsset" },
    contextInput: { type: String },
    otherProfileContext: { type: String },

    transcript: { type: [TranscriptMessageSchema], required: true },
    rawExtractedText: { type: String },

    extraction: {
      status: { type: String, enum: ["queued", "succeeded", "failed"], required: true },
      warnings: { type: [String] },
    }
  },
  { timestamps: true }
)

const ConversationSnapshot = models?.ConversationSnapshot || model<IConversationSnapshot>("ConversationSnapshot", ConversationSnapshotSchema);

export default ConversationSnapshot;