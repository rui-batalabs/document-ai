import {Router} from 'express';
import multer from 'multer';
import {GridFsStorage} from 'multer-gridfs-storage';
import {GridFSBucket, ObjectId} from 'mongodb';
import {users} from '../config/mongoCollections.js';
import {dbConnection} from '../config/mongoConnection.js';
import {mongoConfig} from '../config/settings.js';

const router = Router();

const mongoURI = `${mongoConfig.serverUrl}/${mongoConfig.database}`;
console.log(`MongoDB URI: ${mongoURI}`);

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

        const files = await bucket.find({'metadata.user': req.session.user.email}).toArray();

        res.render('dashboard', {
            username: user.username || 'User',
            documents: files,
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
router.post('/upload', async (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/signin');
    }

    const storage = new GridFsStorage({
        url: mongoURI,
        file: (req, file) => {
            if (!req.session.user.email) {
                throw new Error('User email is missing from the session.');
            }

            return {
                bucketName: 'uploads',
                filename: `${Date.now()}-${file.originalname}`,
                metadata: {user: req.session.user.email},
                id: new ObjectId(),
            };
        },
    });

    const upload = multer({storage}).single('document');

    upload(req, res, async (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).send('File upload failed.');
        }

        if (!req.file || !req.file.id) {
            console.error('File upload did not return a valid file object.');
            return res.status(500).send('File upload failed.');
        }

        try {
            console.log(`File uploaded successfully: ${req.file.filename}`);
            res.redirect('/dashboard');
        } catch (error) {
            console.error('Error saving file data:', error);
            res.status(500).send('Internal Server Error');
        }
    });
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

export default router;
