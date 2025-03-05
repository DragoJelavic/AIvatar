import mongoose, { Schema, Document } from 'mongoose';

export interface IAvatar extends Document {
  name: string;
  weapon: 'Sword' | 'Bow' | 'Staff' | 'Dagger' | 'Axe' | 'Gun';
  clothes: string;
  hairColor: string;
  facialHair?: boolean;
  gender: 'Male' | 'Female' | 'Non-binary' | 'Other';
  genre:
    | 'Fantasy'
    | 'Sci-Fi'
    | 'Steampunk'
    | 'Cyberpunk'
    | 'Historical';
  imageUrl: string;
  createdAt: Date;
  user: mongoose.Types.ObjectId;
}

const AvatarSchema: Schema = new Schema({
  name: { type: String, required: true },
  weapon: {
    type: String,
    enum: ['Sword', 'Bow', 'Staff', 'Dagger', 'Axe', 'Gun'],
    required: true,
  },
  clothes: { type: String, required: true },
  hairColor: { type: String, required: true },
  facialHair: { type: Boolean, default: false },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Other'],
    required: true,
  },
  genre: {
    type: String,
    enum: [
      'Fantasy',
      'Sci-Fi',
      'Steampunk',
      'Cyberpunk',
      'Historical',
    ],
    required: true,
  },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Avatar = mongoose.model<IAvatar>('Avatar', AvatarSchema);
