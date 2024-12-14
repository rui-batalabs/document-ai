import {Router} from 'express';
import multer from 'multer';
import {GridFSBucket, ObjectId} from 'mongodb';
import {dbConnection} from '../config/mongoConnection.js';
import {users} from '../config/mongoCollections.js';
import userData from '../data/users.js';
import helper from '../serverSideHelpers.js';
import {PdfReader} from 'pdfreader';
import OpenAI from 'openai';

const router = Router();
const upload = multer({dest: 'temp/'});

// OpenAI API Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to extract text using pdfreader
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

// Function to split text into chunks
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

/**
 * GET /dashboard
 * Displays the dashboard with the user's uploaded documents.
 */
router.get('/', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/signin');
    }

    try {
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'uploads'});
        const usersCollection = await users();

        const user = await usersCollection.findOne({email: req.session.user.email});
        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Ensure a placeholder image if no profile picture
        user.profile_picture = user.profile_picture || '/noProfilePicture.jpg';

        // Query uploaded documents
        const files = await bucket.find({'metadata.user': req.session.user.email}).toArray();

        res.render('dashboard', {
            user, // Pass the full user object to the template
            documents: files,
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * POST /dashboard/upload
 * Handles document uploads for the user, generates embeddings, word count, and a summary.
 */
router.post('/upload', upload.single('document'), async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/signin');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'uploads'});

        const fs = await import('fs');
        const filePath = req.file.path;

        // Extract text from PDF using pdfreader
        let extractedText = '';
        try {
            extractedText = await extractTextFromPdf(filePath);
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
        }

        if (!extractedText || extractedText.trim() === '') {
            console.error('No text extracted from the PDF.');
            await fs.promises.unlink(filePath);
            return res.status(400).send('No text found in the PDF. Please upload a text-based PDF.');
        }

        // Calculate word count
        const wordCount = extractedText.split(/\s+/).length;

        // Chunk the text for embeddings
        const textChunks = chunkText(extractedText, 512);

        // Generate OpenAI embeddings for each chunk
        const embeddings = [];
        for (const chunk of textChunks) {
            try {
                const embeddingResponse = await openai.embeddings.create({
                    model: 'text-embedding-ada-002', input: chunk,
                });
                embeddings.push(embeddingResponse.data[0].embedding);
            } catch (embeddingError) {
                console.error('Error generating embeddings:', embeddingError);
                await fs.promises.unlink(filePath); // Clean up temporary file
                return res.status(500).send('Error generating embeddings. Please try again later.');
            }
        }

        // Generate a summary of the document
        const summary = await generateSummary(extractedText);

        // Upload the file to GridFS
        const uploadStream = bucket.openUploadStream(req.file.originalname, {
            metadata: {
                user: req.session.user.email, embeddings, textChunks, wordCount, summary,
            },
        });

        const stream = fs.createReadStream(filePath);

        stream.pipe(uploadStream)
            .on('error', async (error) => {
                console.error('Error uploading file:', error);
                await fs.promises.unlink(filePath);
                res.status(500).send('File upload failed.');
            })
            .on('finish', async () => {
                console.log(`File uploaded successfully: ${uploadStream.id}`);
                await userData.addUserDocument(req.session.user.email, uploadStream.id);

                // Delete the temporary file
                await fs.promises.unlink(filePath);

                res.redirect('/dashboard');
            });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Generate a summary of the extracted text using OpenAI API.
 * Handles long inputs by truncating or processing in chunks.
 * @param {string} text - The extracted text from the document.
 * @returns {Promise<string>} - A summary of the document.
 */
const generateSummary = async (text) => {
    const maxInputTokens = 4000;
    const maxOutputTokens = 300;

    if (text.split(/\s+/).length > maxInputTokens) {
        text = text.split(/\s+/).slice(0, maxInputTokens).join(' ');
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4', messages: [{
                role: 'system',
                content: 'You are an assistant that summarizes long documents into concise, meaningful summaries.',
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


/**
 * GET /dashboard/download/:id
 * Handles file download by ID.
 */
router.get('/download/:id', async (req, res) => {
    const fileId = new ObjectId(req.params.id);

    try {
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'uploads'});

        bucket
            .openDownloadStream(fileId)
            .pipe(res)
            .on('error', (error) => {
                console.error('Error downloading file:', error);
                res.status(500).send('Internal Server Error');
            });
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * GET /dashboard/delete/:id
 * Handles file deletion by ID.
 */
router.get('/delete/:id', async (req, res) => {
    const fileId = new ObjectId(req.params.id);

    try {
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'uploads'});

        await bucket.delete(fileId);
        const email = helper.emailCheck(req.session.user.email);
        await userData.deleteUserFile(email, fileId);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
