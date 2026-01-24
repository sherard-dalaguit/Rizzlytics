import { model, models, Schema, Types, Document } from "mongoose";

export interface IProfile {
  userId: Types.ObjectId;

  myProfileAssetIds: Types.ObjectId[];
  contextInput?: string;

  analysisId?: Types.ObjectId;
}

export interface IProfileDoc extends IProfile, Document {}
const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    myProfileAssetIds: { type: [Schema.Types.ObjectId], ref: "MediaAsset", required: true },
    contextInput: { type: String },

    analysisId: { type: Schema.Types.ObjectId, ref: "Analysis" },
  },
  { timestamps: true }
)

const Profile = models?.Profile || model<IProfile>("Profile", ProfileSchema);

export default Profile;