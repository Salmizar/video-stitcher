const express = require('express');
const router = express.Router();
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const savedFilesFolder = process.env.SAVED_FILES_FOLDER;

router.get('/:sessionId', (req, res) => {
    try {
        const filePath = savedFilesFolder + req.params.sessionId + '/' + req.query.filename;
        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({
                success: false,
                error: "No Session found"
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.response ? error.response.data : "There was an issue on the server"
        });
    }
})
module.exports = router;