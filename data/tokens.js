import { ObjectId, ReturnDocument } from 'mongodb';
import { passwordTokens } from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js';
import e from 'express';

const exportedMethods = {

    asnyc getAllTokens(){
        const tokenCollection = await passwordTokens();
        const tokens = tokenCollection.find({}).toArray();
        if(!tokens) throw 'There are no valid password reset tokens';
        tokens = tokens.map((element) => {  
            element._id = element._id.toString();  
            return element; 
          });

        return tokens;
    },

    async updateTokenExpiration(token){
        const tokenCollection = await passwordTokens();
        const userToken = await tokenCollection.findOneAndUpdate(
            {token: token, accessed:false},
            {$set: {time_created: new Date(), time_expired: new Date(Date.now() +15*60000)}},
            {returnDocument:'after'}
        );

        if(!userToken) throw 'No token found';

    },


    async createToken(email){
        //generate token, accessed = false, id, timecreated + timeexpired
        const token = helper.tokenGenerator();
        email = helper.emailCheck(email);

        const addToken = {
            email:email,
            token:token,
            accessed:false,
            time_created:new Date(Date.now()),
            time_expired: new Date(Date.now() + 1000*60)
        }
        const tokenCollection = await tokens();
        const ifToken = await tokenCollection.find({email:email});
        if(ifToken) {
             const newToken = await tokenCollection.findOneAndUpdate({email:email},
                {$set: addToken},
                {returnDocument:'after'}
             );
    }
        else{
            const newToken = await tokenCollection.insertOne(addToken);
        }
        if(!newToken) throw 'Error adding token';
        return newToken;
}






}
export default exportedMethods;