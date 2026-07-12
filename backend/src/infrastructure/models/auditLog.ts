import { Schema, model, Document } from 'mongoose';
import { AuditLog } from '../../../../shared/types';

export interface AuditLogDocument extends Omit<AuditLog, 'id' | 'createdAt'>, Document {
  createdAt: Date;
}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

export const AuditLogModel = model<AuditLogDocument>('AuditLog', AuditLogSchema);
export default AuditLogModel;
