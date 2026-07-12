import { Schema, model, Document, Types } from 'mongoose';
import { AIAnalysis, AIFinding, AIRecommendation } from '../../../../shared/types';

export interface AIAnalysisDocument extends Omit<AIAnalysis, 'id' | 'organizationId' | 'disclosureId' | 'createdAt'>, Document {
  organizationId: Types.ObjectId;
  disclosureId: Types.ObjectId | null;
  createdAt: Date;
}

const AIFindingSchema = new Schema<AIFinding>(
  {
    id: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['environmental', 'social', 'governance'],
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    metricReference: { type: String, default: null },
    citation: { type: String, default: null },
  },
  { _id: false }
);

const AIRecommendationSchema = new Schema<AIRecommendation>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
    },
    actionableSteps: [{ type: String }],
  },
  { _id: false }
);

const AIAnalysisSchema = new Schema<AIAnalysisDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    disclosureId: {
      type: Schema.Types.ObjectId,
      ref: 'DataDisclosure',
      default: null,
      index: true,
    },
    frameworks: [
      {
        type: String,
        required: true,
        enum: ['GRI', 'SASB', 'TCFD', 'CSRD'],
      },
    ],
    complianceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    findings: [AIFindingSchema],
    recommendations: [AIRecommendationSchema],
    performedBy: {
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
        if (ret.disclosureId) {
          ret.disclosureId = ret.disclosureId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const AIAnalysisModel = model<AIAnalysisDocument>('AIAnalysis', AIAnalysisSchema);
export default AIAnalysisModel;
