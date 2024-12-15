import {dbConnection} from '../config/mongoConnection.js';
import {users} from '../config/mongoCollections.js';
import {GridFSBucket} from 'mongodb';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import {PdfReader} from 'pdfreader';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const extractTextFromPdf = async (filePath) => {
    return new Promise((resolve, reject) => {
        const pdfReader = new PdfReader();
        let text = '';

        pdfReader.parseFileItems(filePath, (err, item) => {
            if (err) return reject(err);

            if (!item) {
                return resolve(text.trim());
            }

            if (item.text) {
                text += `${item.text} `;
            }
        });
    });
};

const chunkText = (text, maxTokens = 8192) => {
    const words = text.split(/\s+/);
    const chunks = [];
    let currentChunk = [];

    words.forEach((word) => {
        if (currentChunk.join(' ').length + word.length + 1 > maxTokens) {
            chunks.push(currentChunk.join(' '));
            currentChunk = [];
        }
        currentChunk.push(word);
    });

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
};

const generateEmbeddings = async (text) => {
    const chunks = chunkText(text, 512);
    const embeddings = [];

    for (const chunk of chunks) {
        try {
            const response = await openai.embeddings.create({
                model: 'text-embedding-ada-002', input: chunk,
            });
            embeddings.push(response.data[0].embedding);
        } catch (error) {
            console.error('Error generating embeddings:', error);
        }
    }

    return embeddings;
};

const generateSummary = async (text) => {
    const maxInputTokens = 4000;
    const maxOutputTokens = 300;

    if (text.split(/\s+/).length > maxInputTokens) {
        text = text.split(/\s+/).slice(0, maxInputTokens).join(' ');
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4', messages: [{
                role: 'system', content: 'You are an assistant that summarizes long documents into concise summaries.',
            }, {
                role: 'user', content: `Please summarize the following text into one sentence:\n\n${text}`,
            },], max_tokens: maxOutputTokens,
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating summary:', error);
        return 'Summary could not be generated.';
    }
};

const seed = async () => {
    console.log('Starting seed script...');
    const testUser = {
        email: 'user@example.com', password: 'Password#123', profile_picture: '/noProfilePicture.jpg',
    };

    const testFileName = '240511514v2.pdf';
    const filePath = path.resolve('./scripts/240511514v2.pdf');

    if (!fs.existsSync(filePath)) {
        console.error('Test document not found at:', filePath);
        process.exit(1);
    }

    const db = await dbConnection();
    const usersCollection = await users();
    const bucket = new GridFSBucket(db, {bucketName: 'uploads'});

    try {
        console.log('Checking for existing test user...');
        const existingUser = await usersCollection.findOne({email: testUser.email});
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(testUser.password, 10);
            const newUser = {
                email: testUser.email, hashed_password: hashedPassword, uploaded_docs: [], queries: [],
            };
            await usersCollection.insertOne(newUser);
            console.log('Test user added:', testUser.email);
        } else {
            console.log('Test user already exists:', testUser.email);
        }

        console.log('Checking for existing test document...');
        const existingFile = await bucket.find({'metadata.user': testUser.email}).toArray();
        if (existingFile.length === 0) {
            console.log('Processing test document...');
            const extractedText = await extractTextFromPdf(filePath);
            const wordCount = extractedText.split(/\s+/).length;
            const embeddings = await generateEmbeddings(extractedText);
            const summary = await generateSummary(extractedText);

            console.log('Uploading test document to database...');
            await new Promise((resolve, reject) => {
                const uploadStream = bucket.openUploadStream(testFileName, {
                    metadata: {
                        user: testUser.email, wordCount, summary, embeddings, textChunks: chunkText(extractedText, 512),
                    },
                });

                fs.createReadStream(filePath)
                    .pipe(uploadStream)
                    .on('finish', () => {
                        console.log('Test document uploaded successfully:', testFileName);
                        resolve();
                    })
                    .on('error', (error) => {
                        console.error('Error uploading test document:', error);
                        reject(error);
                    });
            });

            console.log('Retrieving uploaded document...');
            const uploadedDocs = await bucket.find({'metadata.user': testUser.email}).toArray();
            if (uploadedDocs.length > 0) {
                const uploadedDoc = uploadedDocs[0];
                await usersCollection.updateOne({email: testUser.email}, {$push: {uploaded_docs: uploadedDoc._id}});
                console.log('Test document added to user uploaded_docs:', uploadedDoc._id);
            } else {
                console.error('No document found after upload.');
            }
        } else {
            console.log('Test document already exists:', testFileName);
        }
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        console.log('Closing database connection.');
        await db.client.close();
    }
};

seed();
