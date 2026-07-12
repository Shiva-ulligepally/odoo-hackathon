import { Schema, model, Document, Types } from 'mongoose';
import { DataDisclosure } from '../../../../shared/types';

export interface DataDisclosureDocument extends Omit<DataDisclosure, 'id' | 'organizationId' | 'createdAt'>, Document {
  organizationId: Types.ObjectId;
  createdAt: Date;
}

const DataDisclosureSchema = new Schema<DataDisclosureDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    reportingYear: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded',
    },
    extractedMetricsCount: {
      type: Number,
      default: 0,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.organizationId = ret.organizationId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const DataDisclosureModel = model<DataDisclosureDocument>('DataDisclosure', DataDisclosureSchema);
export default DataDisclosureModel;
