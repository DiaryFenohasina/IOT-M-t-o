import * as Crypto from 'expo-crypto';

import { getDatabase } from '@/services/database';
import type { User } from '@/types/auth';

type UserRow = User & {
  password_hash: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hashPassword = async (email: string, password: string) =>
  Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${normalizeEmail(email)}:${password}`,
  );

export const getCurrentUser = async (): Promise<User | null> => {
  const db = await getDatabase();

  return db.getFirstAsync<User>(
    `SELECT users.id, users.name, users.email
     FROM sessions
     INNER JOIN users ON users.id = sessions.user_id
     WHERE sessions.id = 1`,
  );
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  const db = await getDatabase();
  const cleanEmail = normalizeEmail(email);
  const passwordHash = await hashPassword(cleanEmail, password);

  await db.runAsync(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    name.trim(),
    cleanEmail,
    passwordHash,
  );

  const user = await db.getFirstAsync<User>(
    'SELECT id, name, email FROM users WHERE email = ?',
    cleanEmail,
  );

  if (!user) {
    throw new Error('Utilisateur introuvable apres inscription.');
  }

  await db.runAsync('INSERT OR REPLACE INTO sessions (id, user_id) VALUES (1, ?)', user.id);

  return user;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const db = await getDatabase();
  const cleanEmail = normalizeEmail(email);
  const passwordHash = await hashPassword(cleanEmail, password);
  const user = await db.getFirstAsync<UserRow>(
    'SELECT id, name, email, password_hash FROM users WHERE email = ?',
    cleanEmail,
  );

  if (!user || user.password_hash !== passwordHash) {
    throw new Error('Email ou mot de passe incorrect.');
  }

  await db.runAsync('INSERT OR REPLACE INTO sessions (id, user_id) VALUES (1, ?)', user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const logoutUser = async () => {
  const db = await getDatabase();

  await db.runAsync('DELETE FROM sessions WHERE id = 1');
};
