import {login} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';


const exportedMethods{

    //can use this method to get all users
    //will probably end up using it to query if this specifica user is found
    async createTeam (username, password){



        
    }



    async getAllUsers(){
        const usersCollection = await users();
        let usersList = await usersCollection.find({}).toArray();
        if(!usersList) throw 'Could not get all users';
        usersList = usersList.map((element) => {  
            element._id = element._id.toString();  
            return element; 
          });
          return usersList; 
};

    async userExists(username){

    }



}

export default exportedMethods;