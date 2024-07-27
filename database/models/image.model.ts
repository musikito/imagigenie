import { Document, model, models, Schema } from "mongoose";

export interface IImage extends Document {
    title: string;
    transformationType: string;
    transformationUrl?: URL;
    secureUrl: URL;
    publicId: string;
    width?: number;
    height?: number;
    createdAt?: Date;
    updatedAt?: Date;
    config?: object;
    aspectRatio?: string;
    color?: string;
    prompt?: string;
    author?: {
    _id: string;
    firstname: string;
    lastName: string;
    };
  }

const ImageSchema = new Schema({
  title: { type: String, required: true },
  transformationType: { type: String, required: true },
  transformationUrl: { type: URL},
  secureUrl: { type: URL, required: true },
  publicId: { type: String, required: true },
  width: { type: Number },
  height: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  config: { type: Object },
  aspectRatio: { type: String },
  color: { type: String },
  prompt: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User" },
});

const Image = models?.Image || model("Image", ImageSchema);

export default Image;
