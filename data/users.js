import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js';


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

async addUserDocument(email, document_id){
    email = helper.emailCheck(email);
    if(!document_id) throw 'no document id';
    if (!ObjectId.isValid(document_id)) {
      throw new Error('invalid object ID');
    };
    const usersCollection = await users();
    const updatedUser = await usersCollection.findOneAndUpdate(
            {email: email},
            {$push: {uploaded_docs: document_id}},
            {returnDocument: 'after'}
    )
    if(!updatedUser) throw 'error adding document id to user documents';
    return updatedUser;
},

async addUserQuery(email, query_id){
  email = helper.emailCheck(email);
  if(!query_id) throw 'no document id';
  if (!ObjectId.isValid(query_id)) {
    throw new Error('invalid object ID');
  };
  const usersCollection = await users();
  const updatedUser = await usersCollection.findOneAndUpdate(
          {email: email},
          {$push: {queries: query_id}},
          {returnDocument: 'after'}
  )
  if(!updatedUser) throw 'error adding document id to user documents';
  return updatedUser;
},

async deleteUserFile(email, fileId){
  email = helper.emailCheck(email);
  if(!fileId) throw 'no document id';
  if (!ObjectId.isValid(fileId)) {
    throw new Error('invalid object ID');
  };
  const usersCollection = await users();
  const updatedUser = await usersCollection.findOneAndUpdate(
          {email: email},
          {$pull: {uploaded_docs: new ObjectId(fileId)}},
          {returnDocument: 'after'}
  )
  if(!updatedUser) throw 'error adding document id to user documents';
  return updatedUser;
}



};


export default exportedMethods;

