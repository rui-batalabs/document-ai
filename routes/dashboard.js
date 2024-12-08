import {Router} from 'express';
import multer from 'multer';
import path from 'path';
import {fileURLToPath} from 'url';
import {users} from '../config/mongoCollections.js'; // Import the users collection

const router = Router();

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({
    dest: path.join(__dirname, '../uploads/'), limits: {fileSize: 10 * 1024 * 1024}, // 10MB limit
});

/**
 * GET /dashboard
 * Displays the dashboard with the user's uploaded documents.
 */
router.get('/', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/signin');
    }

    try {
        const usersCollection = await users();
        const user = await usersCollection.findOne({email: req.session.user.email});

        if (!user) {
            return res.status(404).send('User not found.');
        }

        res.render('dashboard', {
            username: user.username || 'User', documents: user.uploaded_docs || [],
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * POST /dashboard/upload
 * Handles document uploads for the user.
 */
router.post('/upload', upload.single('document'), async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/signin');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const usersCollection = await users();
        const user = await usersCollection.findOne({email: req.session.user.email});

        if (!user) {
            return res.status(404).send('User not found.');
        }

        const document = {
            filename: req.file.originalname, path: req.file.path, uploadedAt: new Date(),
        };

        await usersCollection.updateOne({email: req.session.user.email}, {$push: {uploaded_docs: document}});

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
