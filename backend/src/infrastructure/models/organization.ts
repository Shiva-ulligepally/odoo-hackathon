import { Schema, model, Document } from 'mongoose';
import { Organization } from '../../../../shared/types';

export interface OrganizationDocument extends Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    sector: {
      type: String,
      required: true,
      enum: [
        'Energy',
        'Materials & Manufacturing',
        'Technology & Communications',
        'Financial Services',
        'Healthcare & Pharmaceuticals',
        'Consumer Goods & Retail',
        'Transportation & Logistics',
        'Utilities',
      ],
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    establishedYear: {
      type: Number,
      required: true,
    },
    esgScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    environmentalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    socialScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    governanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAnalyzedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const OrganizationModel = model<OrganizationDocument>('Organization', OrganizationSchema);
export default OrganizationModel;
