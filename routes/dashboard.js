import {Router} from 'express';
import multer from 'multer';
import {GridFSBucket, ObjectId} from 'mongodb';
import {dbConnection} from '../config/mongoConnection.js';
import {users} from '../config/mongoCollections.js';
import userData from '../data/users.js';
import helper from '../serverSideHelpers.js';

const router = Router();
const upload = multer({dest: 'temp/'});

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

        // Fetch user data
        const user = await usersCollection.findOne({email: req.session.user.email});
        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Query uploaded documents
        const files = await bucket.find({'metadata.user': req.session.user.email}).toArray();

        res.render('dashboard', {
            username: user.username || 'User', documents: files,
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
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'uploads'});

        const uploadStream = bucket.openUploadStream(req.file.originalname, {
            metadata: {user: req.session.user.email},
        });

        const fs = await import('fs');
        const stream = fs.createReadStream(req.file.path);

        stream.pipe(uploadStream)
            .on('error', (error) => {
                console.error('Error uploading file:', error);
                res.status(500).send('File upload failed.');
            })
            .on('finish', async () => {
                console.log(`File uploaded successfully: ${uploadStream.id}`);
                const user = await userData.addUserDocument(req.session.user.email, uploadStream.id);
                res.redirect('/dashboard');
            });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Internal Server Error');
    }
});

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

router.get('/delete/:id', async (req, res) => {
    const fileId = new ObjectId(req.params.id);

    try{
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'uploads'});

        await bucket.delete(fileId);
        const email = helper.emailCheck(req.session.user.email);
        const updatedUser = userData.deleteUserFile(email, fileId);
        res.redirect('/dashboard');
    }
    catch(error) {
        console.error('Error deleting file:', error);
        res.status(500).send('Internal Server Error');
    }
})



export default router;
