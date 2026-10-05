import mongoosePkg from 'mongoose';

const { Schema, model } = mongoosePkg;

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  resetPasswordCode: { type: String, default: null },
  resetPasswordExpires: { type: String, default: null },
  totalPoints: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: null },
  unlockedBadges: [{
    id: String,
    name: String,
    icon: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  settings: {
    notificationsEnabled: { type: Boolean, default: false },
    soundEnabled: { type: Boolean, default: true },
    dailyReminderTime: { type: String, default: '20:00' }
  }
}, { timestamps: true });

const TaskSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Personal' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  repeatFrequency: { type: String, enum: ['once', 'daily', 'weekly', 'selected_days', 'custom'], default: 'daily' },
  repeatDays: [{ type: Number }], // 0 for Sunday, 1 for Monday, etc.
  startDate: { type: String, required: true }, // YYYY-MM-DD
  dueTime: { type: String, default: '20:00' }, // HH:mm
  points: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const OccurrenceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  taskId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  scheduledDate: { type: String, required: true, index: true }, // YYYY-MM-DD
  scheduledTime: { type: String, default: '20:00' },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed', 'completed_late', 'skipped'],
    default: 'pending'
  },
  completedAt: { type: String, default: null }, // ISO string or YYYY-MM-DD
  originalDueDate: { type: String, required: true }, // YYYY-MM-DD
  pointsEarned: { type: Number, default: 0 },
  snoozeUntil: { type: String, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

const CategorySchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, default: null }, // null for default system categories
  name: { type: String, required: true },
  icon: { type: String, default: '📌' },
  color: { type: String, default: 'indigo' }
}, { timestamps: true });

export const UserModel = mongoosePkg.models.User || model('User', UserSchema);
export const TaskModel = mongoosePkg.models.Task || model('Task', TaskSchema);
export const OccurrenceModel = mongoosePkg.models.Occurrence || model('Occurrence', OccurrenceSchema);
export const CategoryModel = mongoosePkg.models.Category || model('Category', CategorySchema);
