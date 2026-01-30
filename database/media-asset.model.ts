import { model, models, Schema, Types, Document } from "mongoose";

export interface IMediaAsset {
  userId: Types.ObjectId;
  assetType: "image";
  category: "self_photo" | "other_profile_photo" | "my_profile_photo" | "chat_screenshot"

  analysisId?: Types.ObjectId;

  storageProvider: "vercel_blob"
  blobUrl?: string;
  blobPathname?: string;
}

export interface IMediaAssetDoc extends IMediaAsset, Document {}
const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assetType: { type: String, enum: ["image"], required: true },
    category: { type: String, enum: ["self_photo", "other_profile_photo", "my_profile_photo", "chat_screenshot"], required: true },

    analysisId: { type: Schema.Types.ObjectId, ref: "Analysis" },

    storageProvider: { type: String, enum: ["vercel_blob"], required: true },
    blobUrl: { type: String },
    blobPathname: { type: String },
  },
  { timestamps: true }
)

const MediaAsset = models?.MediaAsset || model<IMediaAsset>("MediaAsset", MediaAssetSchema);

export default MediaAsset;