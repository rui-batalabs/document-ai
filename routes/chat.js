import {Router} from 'express';
import {GridFSBucket, ObjectId} from 'mongodb';
import {dbConnection} from '../config/mongoConnection.js';
import OpenAI from 'openai';

const router = Router();

// OpenAI API Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};

// Function to find top relevant chunks
const findRelevantChunks = (queryEmbedding, embeddings, textChunks, chunkSize = 5) => {
    return embeddings
        .map((embedding, index) => ({
            index,
            similarity: cosineSimilarity(queryEmbedding, embedding),
            text: textChunks[index],
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, chunkSize);
};

/**
 * GET /chat/:id
 * Renders the chat page for a specific document.
 */
router.get('/:id', async (req, res) => {
    const fileId = new ObjectId(req.params.id);

    try {
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'uploads'});

        const file = await bucket.find({_id: fileId}).toArray();
        if (!file || file.length === 0) {
            return res.status(404).send('File not found.');
        }

        const document = file[0];
        res.render('chat', {documentId: fileId.toString(), documentName: document.filename || 'Unknown Document'});
    } catch (error) {
        console.error('Error rendering chat page:', error);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * POST /chat/:id
 * Handles chat interactions for a specific document.
 */
router.post('/:id', async (req, res) => {
    const fileId = new ObjectId(req.params.id);
    const {question} = req.body;

    if (!question || question.trim() === '') {
        return res.status(400).send({error: 'Question cannot be empty.'});
    }

    try {
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'uploads'});

        const file = await bucket.find({_id: fileId}).toArray();
        if (!file || file.length === 0) {
            return res.status(404).send({error: 'File not found.'});
        }

        const metadata = file[0].metadata;
        const {embeddings, textChunks} = metadata;

        if (!embeddings || embeddings.length === 0 || !textChunks || textChunks.length === 0) {
            return res.status(400).send({error: 'No embeddings or text found for this document.'});
        }

        // Generate an embedding for the user's question
        const questionEmbeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: question,
        });
        const questionEmbedding = questionEmbeddingResponse.data[0].embedding;

        // Find the most relevant chunks
        const relevantChunks = findRelevantChunks(questionEmbedding, embeddings, textChunks, 5);
        const contextText = relevantChunks.map((chunk) => chunk.text).join('\n');

        console.log('Relevant context:', contextText);

        // Truncate the context to fit within the model's limits
        const truncatedContext = contextText.slice(0, 8000);

        // Query the LLM with the question and relevant context
        const openaiResponse = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {role: 'system', content: 'You are a helpful assistant.'},
                {role: 'assistant', content: `Context: ${truncatedContext}`},
                {role: 'user', content: question},
            ],
        });

        const answer = openaiResponse.choices[0].message.content;

        res.send({answer});
    } catch (error) {
        console.error('Error handling chat:', error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * GET /pdf/:id
 * Serves the PDF document from MongoDB.
 */
router.get('/pdf/:id', async (req, res) => {
    const fileId = new ObjectId(req.params.id);

    try {
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'uploads'});

        const downloadStream = bucket.openDownloadStream(fileId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');

        downloadStream.on('error', (err) => {
            console.error('Error serving PDF:', err);
            res.status(500).send('Error serving PDF.');
        });

        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error fetching PDF:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
