import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import helper from '../serverSideHelpers.js';
import bcrypt from 'bcryptjs';
import xss from 'xss';

const exportedMethods = {
    async addUser(username, email, password, hashed_password) {
        username = xss(helper.usernameCheck(username));
        email = xss(helper.emailCheck(email));
        password = helper.passwordCheck(password);
        hashed_password = await helper.hashedPasswordCheck(password, hashed_password);

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

    async getAllUsers() {
        const usersCollection = await users();
        let usersList = await usersCollection.find({}).toArray();
        if (!usersList) throw 'Could not get all users';
        usersList = usersList.map((element) => {
            element._id = element._id.toString();
            return element;
        });
        return usersList;
    },

    async addUserDocument(email, document_id) {
        email = xss(helper.emailCheck(email));
        if (!document_id) throw 'No document ID provided.';
        if (!ObjectId.isValid(document_id)) {
            throw new Error('Invalid ObjectId');
        }

        const usersCollection = await users();
        const updatedUser = await usersCollection.findOneAndUpdate(
            { email: email },
            { $push: { uploaded_docs: document_id } },
            { returnDocument: 'after' }
        );
        if (!updatedUser) throw 'Error adding document ID to user documents.';
        return updatedUser;
    },

    async updateProfilePicture(email, profilePictureUrl) {
        email = xss(helper.emailCheck(email));
        profilePictureUrl = xss(profilePictureUrl);
        if (!profilePictureUrl || typeof profilePictureUrl !== 'string') {
            throw new Error('Invalid profile picture URL');
        }

        const usersCollection = await users();

        const updatedUser = await usersCollection.findOneAndUpdate(
            { email: email },
            { $set: { profile_picture: profilePictureUrl } },
            { returnDocument: 'after' }
        );

        if (!updatedUser.value) {
            throw new Error('Failed to update profile picture');
        }

        return updatedUser.value; // Return the updated user object
    },

    async addUserQuery(email, query_id) {
        email = xss(helper.emailCheck(email));
        if (!query_id) throw 'No query ID provided.';
        if (!ObjectId.isValid(query_id)) {
            throw new Error('Invalid ObjectId');
        }

        const usersCollection = await users();
        const updatedUser = await usersCollection.findOneAndUpdate(
            { email: email },
            { $push: { queries: query_id } },
            { returnDocument: 'after' }
        );
        if (!updatedUser) throw 'Error adding query ID to user queries.';
        return updatedUser;
    },

    async deleteUserFile(email, fileId) {
        email = xss(helper.emailCheck(email));
        if (!fileId) throw 'No file ID provided.';
        if (!ObjectId.isValid(fileId)) {
            throw new Error('Invalid ObjectId');
        }

        const usersCollection = await users();
        const updatedUser = await usersCollection.findOneAndUpdate(
            { email: email },
            { $pull: { uploaded_docs: new ObjectId(fileId) } },
            { returnDocument: 'after' }
        );
        if (!updatedUser) throw 'Error removing file ID from user documents.';
        return updatedUser;
    },

    async changeUserPassword(email, password, confirmPassword) {
        email = xss(helper.emailCheck(email));
        password = helper.passwordCheck(password);
        confirmPassword = helper.passwordCheck(confirmPassword);
        if (password !== confirmPassword) throw 'Passwords do not match';

        const hashed_password = await bcrypt.hash(password, 10);
        const userCollection = await users();
        const updatedPassword = await userCollection.findOneAndUpdate(
            { email: email },
            { $set: { hashed_password: hashed_password } },
            { returnDocument: 'after' }
        );
        if (!updatedPassword) throw 'Error updating password';
        return updatedPassword;
    }
};

export default exportedMethods;
