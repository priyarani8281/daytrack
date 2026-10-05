import fs from 'fs';
import path from 'path';
import { DB_FILE, isMongo, ensureLocalDb } from '../config/db.js';
import { UserModel, TaskModel, OccurrenceModel, CategoryModel } from './schemas.js';

function readLocalDb() {
  ensureLocalDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local DB, initializing new:', err);
    ensureLocalDb();
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local DB:', err);
  }
}

export const store = {
  // --- USER OPERATIONS ---
  async findUserByEmail(email) {
    if (isMongo()) {
      return await UserModel.findOne({ email: email.toLowerCase() }).lean();
    }
    const db = readLocalDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (isMongo()) {
      return await UserModel.findOne({ id }).lean();
    }
    const db = readLocalDb();
    return db.users.find(u => u.id === id) || null;
  },

  async findUsers(filter = {}) {
    if (isMongo()) {
      return await UserModel.find(filter).lean();
    }
    const db = readLocalDb();
    return db.users.filter(u => {
      for (const [key, val] of Object.entries(filter)) {
        if (u[key] !== val) return false;
      }
      return true;
    });
  },

  async createUser(userData) {
    if (isMongo()) {
      const doc = new UserModel(userData);
      await doc.save();
      return doc.toObject();
    }
    const db = readLocalDb();
    db.users.push(userData);
    writeLocalDb(db);
    return userData;
  },

  async updateUser(id, updates) {
    if (isMongo()) {
      return await UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    }
    const db = readLocalDb();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    db.users[index] = { ...db.users[index], ...updates };
    writeLocalDb(db);
    return db.users[index];
  },

  // --- TASK OPERATIONS ---
  async findTasks(filter = {}) {
    if (isMongo()) {
      return await TaskModel.find(filter).lean();
    }
    const db = readLocalDb();
    return db.tasks.filter(t => {
      for (const [key, val] of Object.entries(filter)) {
        if (t[key] !== val) return false;
      }
      return true;
    });
  },

  async findTaskById(id) {
    if (isMongo()) {
      return await TaskModel.findOne({ id }).lean();
    }
    const db = readLocalDb();
    return db.tasks.find(t => t.id === id) || null;
  },

  async createTask(taskData) {
    if (isMongo()) {
      const doc = new TaskModel(taskData);
      await doc.save();
      return doc.toObject();
    }
    const db = readLocalDb();
    db.tasks.push(taskData);
    writeLocalDb(db);
    return taskData;
  },

  async updateTask(id, updates) {
    if (isMongo()) {
      return await TaskModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    }
    const db = readLocalDb();
    const index = db.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    db.tasks[index] = { ...db.tasks[index], ...updates };
    writeLocalDb(db);
    return db.tasks[index];
  },

  async deleteTask(id) {
    if (isMongo()) {
      await TaskModel.deleteOne({ id });
      await OccurrenceModel.deleteMany({ taskId: id });
      return true;
    }
    const db = readLocalDb();
    db.tasks = db.tasks.filter(t => t.id !== id);
    db.occurrences = db.occurrences.filter(o => o.taskId !== id);
    writeLocalDb(db);
    return true;
  },

  // --- OCCURRENCE OPERATIONS ---
  async findOccurrences(filter = {}) {
    if (isMongo()) {
      return await OccurrenceModel.find(filter).lean();
    }
    const db = readLocalDb();
    return db.occurrences.filter(o => {
      for (const [key, val] of Object.entries(filter)) {
        if (Array.isArray(val)) {
          if (!val.includes(o[key])) return false;
        } else if (typeof val === 'object' && val !== null) {
          // Handle simple $ne, $lt, $lte, $gt, $gte
          if (val.$ne !== undefined && o[key] === val.$ne) return false;
          if (val.$lt !== undefined && !(o[key] < val.$lt)) return false;
          if (val.$lte !== undefined && !(o[key] <= val.$lte)) return false;
          if (val.$gt !== undefined && !(o[key] > val.$gt)) return false;
          if (val.$gte !== undefined && !(o[key] >= val.$gte)) return false;
        } else if (o[key] !== val) {
          return false;
        }
      }
      return true;
    });
  },

  async findOccurrenceById(id) {
    if (isMongo()) {
      return await OccurrenceModel.findOne({ id }).lean();
    }
    const db = readLocalDb();
    return db.occurrences.find(o => o.id === id) || null;
  },

  async createOccurrence(occData) {
    if (isMongo()) {
      const doc = new OccurrenceModel(occData);
      await doc.save();
      return doc.toObject();
    }
    const db = readLocalDb();
    db.occurrences.push(occData);
    writeLocalDb(db);
    return occData;
  },

  async createManyOccurrences(occList) {
    if (!occList || occList.length === 0) return [];
    if (isMongo()) {
      return await OccurrenceModel.insertMany(occList);
    }
    const db = readLocalDb();
    db.occurrences.push(...occList);
    writeLocalDb(db);
    return occList;
  },

  async updateOccurrence(id, updates) {
    if (isMongo()) {
      return await OccurrenceModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    }
    const db = readLocalDb();
    const index = db.occurrences.findIndex(o => o.id === id);
    if (index === -1) return null;
    db.occurrences[index] = { ...db.occurrences[index], ...updates };
    writeLocalDb(db);
    return db.occurrences[index];
  },

  // --- CATEGORIES OPERATIONS ---
  async findCategories(userId = null) {
    if (isMongo()) {
      return await CategoryModel.find({
        $or: [{ userId: null }, { userId }]
      }).lean();
    }
    const db = readLocalDb();
    return db.categories.filter(c => c.userId === null || c.userId === userId);
  },

  async createCategory(catData) {
    if (isMongo()) {
      const doc = new CategoryModel(catData);
      await doc.save();
      return doc.toObject();
    }
    const db = readLocalDb();
    db.categories.push(catData);
    writeLocalDb(db);
    return catData;
  },

  // --- SEEDING & RESET ---
  async seedDemo(data) {
    if (isMongo()) {
      await UserModel.deleteMany({ id: data.user.id });
      await TaskModel.deleteMany({ userId: data.user.id });
      await OccurrenceModel.deleteMany({ userId: data.user.id });

      await UserModel.create(data.user);
      if (data.tasks?.length) await TaskModel.insertMany(data.tasks);
      if (data.occurrences?.length) await OccurrenceModel.insertMany(data.occurrences);
      return true;
    }
    const db = readLocalDb();
    db.users = db.users.filter(u => u.id !== data.user.id);
    db.tasks = db.tasks.filter(t => t.userId !== data.user.id);
    db.occurrences = db.occurrences.filter(o => o.userId !== data.user.id);

    db.users.push(data.user);
    if (data.tasks) db.tasks.push(...data.tasks);
    if (data.occurrences) db.occurrences.push(...data.occurrences);

    writeLocalDb(db);
    return true;
  }
};
