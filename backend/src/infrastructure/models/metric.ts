import { Schema, model, Document, Types } from 'mongoose';
import { ESGMetric } from '../../../../shared/types';

export interface ESGMetricDocument extends Omit<ESGMetric, 'id' | 'organizationId' | 'sourceDocumentId' | 'createdAt' | 'updatedAt'>, Document {
  organizationId: Types.ObjectId;
  sourceDocumentId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ESGMetricSchema = new Schema<ESGMetricDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['environmental', 'social', 'governance'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    sourceDocumentId: {
      type: Schema.Types.ObjectId,
      ref: 'DataDisclosure',
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'verified', 'flagged'],
      default: 'pending',
    },
    verifiedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.organizationId = ret.organizationId.toString();
        if (ret.sourceDocumentId) {
          ret.sourceDocumentId = ret.sourceDocumentId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to ensure uniqueness per organization, metric name, and reporting year.
ESGMetricSchema.index({ organizationId: 1, name: 1, year: 1 }, { unique: true });

export const ESGMetricModel = model<ESGMetricDocument>('ESGMetric', ESGMetricSchema);
export default ESGMetricModel;
