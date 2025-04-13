import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: string | number;
  receiverId: string | number;
  conversationId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create schema for individual messages
const MessageSchema: Schema = new Schema({
  senderId: { type: Schema.Types.Mixed, required: true, ref: 'User' },
  receiverId: { type: Schema.Types.Mixed, required: true, ref: 'User' },
  conversationId: { type: String, required: true },
  content: { type: String, required: true },
  attachments: { type: [String], default: [] },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create schema for conversations (to group messages)
export interface IConversation extends Document {
  participants: (string | number)[];
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: {
    [key: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
  participants: { type: [Schema.Types.Mixed], required: true, ref: 'User' },
  lastMessage: { type: String, default: '' },
  lastMessageDate: { type: Date, default: Date.now },
  unreadCount: { type: Map, of: Number, default: {} },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create model from schemas
export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
