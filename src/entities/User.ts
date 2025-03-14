import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  avatars: mongoose.Types.ObjectId[];
  profilePicture?: string;
  dateOfBirth?: Date;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  joinedDate: Date;
  isActive?: boolean;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  preferences?: {
    theme?: string;
    notifications?: boolean;
  };
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: false, unique: false },
  password: { type: String, required: true },
  avatars: [{ type: Schema.Types.ObjectId, ref: 'Avatar' }],
  profilePicture: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  bio: { type: String, required: false },
  location: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  joinedDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  socialLinks: {
    twitter: { type: String, required: false },
    facebook: { type: String, required: false },
    instagram: { type: String, required: false },
    linkedin: { type: String, required: false },
  },
  preferences: {
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true },
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
