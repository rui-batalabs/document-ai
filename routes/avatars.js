import {Router} from 'express';
import {GridFSBucket, ObjectId} from 'mongodb'; // Import ObjectId to fix the issue
import {dbConnection} from '../config/mongoConnection.js';
import multer from 'multer';

const router = Router();
const upload = multer({dest: 'temp/'});

// Route to fetch an avatar by ID
router.get('/:id', async (req, res) => {
    const fileId = req.params.id;

    try {
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'avatars'});

        // Stream the avatar to the response
        bucket.openDownloadStream(new ObjectId(fileId))
            .on('error', (error) => {
                console.error('Error streaming avatar:', error);
                res.status(404).send('Avatar not found.');
            })
            .pipe(res);
    } catch (error) {
        console.error('Error fetching avatar:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to upload a new avatar
router.post('/uploadAvatar', upload.single('avatar'), async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    if (!req.file) {
        return res.status(400).json({error: 'No file uploaded.'});
    }

    try {
        const db = await dbConnection();
        const bucket = new GridFSBucket(db, {bucketName: 'avatars'});

        const fs = await import('fs');
        const stream = fs.createReadStream(req.file.path);

        const uploadStream = bucket.openUploadStream(req.file.originalname, {
            metadata: {user: req.session.user.email},
        });

        stream.pipe(uploadStream)
            .on('error', async (error) => {
                console.error('Error uploading avatar:', error);
                await fs.promises.unlink(req.file.path);
                res.status(500).json({error: 'Avatar upload failed.'});
            })
            .on('finish', async () => {
                console.log(`Avatar uploaded successfully: ${uploadStream.id}`);

                const usersCollection = db.collection('users');
                const profilePictureUrl = `/avatars/${uploadStream.id}`;
                await usersCollection.updateOne(
                    {email: req.session.user.email},
                    {$set: {profile_picture: profilePictureUrl}}
                );

                await fs.promises.unlink(req.file.path);

                res.json({profilePictureUrl});
            });
    } catch (error) {
        console.error('Error handling avatar upload:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

export default router;
