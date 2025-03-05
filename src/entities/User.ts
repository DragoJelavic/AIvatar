// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  avatars: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: false, unique: false },
  password: { type: String, required: true },
  avatars: [{ type: Schema.Types.ObjectId, ref: 'Avatar' }],
});

export const User = mongoose.model<IUser>('User', UserSchema);
