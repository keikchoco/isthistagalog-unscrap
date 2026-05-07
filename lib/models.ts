import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  displayName: string;
  rank: 'Reducer' | 'Reuser' | 'Recycler' | 'Restorer' | 'Zero Waste';
  totalXP: number;
  impactScore: number;
  matterDiverted: number;
  email: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  displayName: { type: String, required: true },
  rank: { type: String, default: 'Reducer' },
  totalXP: { type: Number, default: 0 },
  impactScore: { type: Number, default: 0 },
  matterDiverted: { type: Number, default: 0 },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export interface IScan extends Document {
  userId: string;
  item: string;
  rarity: string;
  category: string;
  suggestions: any[];
  co2_diverted_grams: number;
  peso_saved: number;
  xp_reward: number;
  safe_to_use: boolean;
  imageUrl?: string;
  timestamp: Date;
}

const ScanSchema: Schema = new Schema({
  userId: { type: String, required: true },
  item: { type: String, required: true },
  rarity: { type: String, required: true },
  category: { type: String },
  suggestions: { type: Array },
  co2_diverted_grams: { type: Number },
  peso_saved: { type: Number },
  xp_reward: { type: Number, default: 0 },
  safe_to_use: { type: Boolean, default: true },
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export interface IPin extends Document {
  userId: string;
  userName: string;
  title: string;
  description: string;
  type: 'scrap' | 'drop-off' | 'exchange';
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

const PinSchema: Schema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['scrap', 'drop-off', 'exchange'], default: 'scrap' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Scan = mongoose.models.Scan || mongoose.model<IScan>('Scan', ScanSchema);
export const Pin = mongoose.models.Pin || mongoose.model<IPin>('Pin', PinSchema);
