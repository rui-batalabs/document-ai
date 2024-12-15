import {ObjectId} from 'mongodb';
import {passwordTokens} from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js';

const exportedMethods = {

    async getAllTokens() {
        const tokenCollection = await passwordTokens();
        let tokens = await tokenCollection.find({}).toArray();
        if (!tokens) throw new Error('There are no valid password reset tokens');

        tokens = tokens.map((element) => {
            element._id = element._id.toString();
            return element;
        });

        return tokens;
    },


    async updateTokenExpiration(token) {
        token = helper.tokenCheck(token);
        const tokenCollection = await passwordTokens();
        const userToken = await tokenCollection.findOneAndUpdate(
            {token: token, accessed: false},
            {$set: {time_created: new Date(), time_expired: new Date(Date.now() + 15 * 60000)}},
            {returnDocument: 'after'}
        );

        if (!userToken.value) throw new Error('No token found');
        return userToken.value;
    },

    async createToken(email) {
        // Generate token, accessed = false, id, time created + time expired
        const token = helper.tokenGenerator();
        email = helper.emailCheck(email);
        let currTime = new Date(Date.now());
        let expireTime = new Date();
        expireTime.setTime(currTime.getTime() + (30*60*1000));

        const addToken = {
            email: email,
            token: token,
            accessed: false,
            time_created: currTime,
            time_expired: expireTime,
        };

        const tokenCollection = await passwordTokens();
        const existingToken = await tokenCollection.findOne({email: email});

        let newToken;
        if (existingToken) {
            newToken = await tokenCollection.findOneAndUpdate(
                {email: email},
                {$set: addToken},
                {returnDocument: 'after'}
            );
        } else {
            const insertResult = await tokenCollection.insertOne(addToken);
            if (insertResult.acknowledged) {
                newToken = await tokenCollection.findOne({_id: insertResult.insertedId});
            }
        }

        if (!newToken) throw new Error('Error adding token');
        return newToken;
    }, 

    async accessedToken(token){
        token = helper.tokenCheck(token);
        const tokenCollection = await passwordTokens();
        const tokenCheck = await tokenCollection.findOne({token: token});
        const currDate = new Date();
        if(tokenCheck.expireTime<currDate) throw 'This email has expired, Please resend email.'
        if(tokenCheck.accessed == true) throw 'This email has already been used, please resend email.'
        const updatedToken = await tokenCollection.findOneAndUpdate(
            {token: token},
            {$set: {accessed:true}},
            {returnDocument:'after'}
        );
        if(!updatedToken) throw 'There were no valid tokens found';
        return updatedToken;
    }

};

//TEST CHANGE
export default exportedMethods;