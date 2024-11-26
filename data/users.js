import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';


const exportedMethods = {
  async addUser(username, email, hashed_password){

  if (!username || typeof username !== 'string' ||username.trim().length === 0) {
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
    hashed_password: hashed_password,
    profile_picture: '',
    uploaded_docs: [],
    queries: [],
  };

  const insertResult = await usersCollection.insertOne(newUser);
  if (!insertResult.acknowledged || !insertResult.insertedId) {
    throw new Error('Could not add user to the database.');
  }

  return {
    insertedId: insertResult.insertedId.toString(),
    ...newUser,
  };
},



async getAllUsers(){
  const usersCollection = await users();
  let usersList = await usersCollection.find({}).toArray();
  if(!usersList) throw 'Could not get all users';
  usersList = usersList.map((element) => {  
      element._id = element._id.toString();  
      return element; 
    });
    return usersList; 
},


};


export default exportedMethods;

