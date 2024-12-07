import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js'
import e from 'express';

const exportedMethods = {
  async addUser(username, email, password, hashed_password){

  username = helper.usernameCheck(username);
  email = helper.emailCheck(email);
  password = helper.passwordCheck(password);
  hashed_password = await helper.hashedPasswordCheck(password, hashed_password)

  

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

