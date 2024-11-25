import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';

export const addUserToDB = async (user) => {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid user object provided.');
  }

  const { username, email, hashed_password, profile_picture = '', uploaded_docs = [], queries = [] } = user;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    throw new Error('Invalid username.');
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Invalid email.');
  }

  if (!hashed_password || typeof hashed_password !== 'string') {
    throw new Error('Invalid hashed password.');
  }

  const usersCollection = await users();

  // Ensure username and email are unique
  const existingUser = await usersCollection.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existingUser) {
    throw new Error('Username or email already exists.');
  }

  const newUser = {
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    hashed_password,
    profile_picture: profile_picture.toLowerCase(),
    uploaded_docs,
    queries,
  };

  const insertResult = await usersCollection.insertOne(newUser);
  if (!insertResult.acknowledged || !insertResult.insertedId) {
    throw new Error('Could not add user to the database.');
  }

  return {
    insertedId: insertResult.insertedId.toString(),
    ...newUser,
  };
};
