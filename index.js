const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // body-parser eklendi
const multer = require('multer');
const ffmpeg = require('ffmpeg');

const app = express();

mongoose.connect('mongodb+srv://sarpertatkoy:Dce2208SCtgCNPuL@capstone.aajahuz.mongodb.net/Capstone');
const db = mongoose.connection;

// Middleware for parsing form data
const upload = multer({ dest: 'uploads/' });

const VideoSchema = new mongoose.Schema({
    title: String,
    videoUrl: String,
    time: Number,
    size: Number,
});

const VideoModel = mongoose.model("Video", VideoSchema);

const UploadedVideoModel = mongoose.model("UploadedVideo", VideoSchema); // Model ismi değiştirildi

app.use(bodyParser.json()); // body-parser middleware eklendi

app.post('/uploadVideo', upload.single('video'), async (req, res) => {
    try {
        // Compress video using Ffmpeg
        const compressedFileName = `compressed_${"video"}`;
        var path = "C:\Users\sarpe\Videos\Captures\eclipse-workspace - Deneme_src_Test.java - Eclipse IDE 2024-01-08 19-21-31.mp4";
        ffmpeg(path)
            .output(compressedFileName)
            .videoCodec('libx264') // Specify video codec for compression
            .on('end', async () => {
                // Save video details to MongoDB
                const video = new UploadedVideoModel({
                    name: req.body.title || 'Untitled Video',
                    videoUrl: "test",
                    time: req.body.time || 'Unknown',
                    size: req.file.size || 'Unknown'
                });
                await video.save();

                // Respond with success message
                res.status(201).json({ message: 'Video uploaded and compressed successfully' });
            })
            .on('error', (err) => {
                console.error('Error compressing video:', err);
                res.status(500).json({ error: 'Error compressing video' });
            })
            .run();
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Error uploading video' });
    }
});

app.get("/getVideos", (req, res) => {
    VideoModel.find({})
        .then(function(Videos) {
            res.json(Videos);
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).json({ error: 'An error occurred while fetching videos.' });
        });
});

app.listen(3001, () => {
    console.log("Server is running");
});