const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const videoFormats = 'mp4,ogg';
const savedFilesFolder = process.env.SAVED_FILES_FOLDER;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (isValidFormat(req.query.filename)) {
            const saveLocation = savedFilesFolder + req.query.session;
            if (!fs.existsSync(saveLocation)) {
                fs.mkdirSync(saveLocation);
            }
            cb(null, saveLocation);
        }
    },
    filename: function (req, file, cb) {
        if (isValidFormat(req.query.filename)) {
            cb(null, req.query.filename);
        }
    }
});
function isValidFormat(filename) {
    let format = filename.substring(filename.lastIndexOf('.') + 1);
    return videoFormats.indexOf(format) > -1;
}
const upload = multer({ storage: storage });
router.get('/:sessionId', (req, res) => {
    try {
        let sessionFolder = savedFilesFolder + req.params.sessionId;
        if (fs.existsSync(sessionFolder)) {
            var fileNames = [];
            fs.readdir(sessionFolder, (err, files) => {
                files.forEach(file => {
                    fileNames.push({
                        "fileName": file
                    });
                });
                res.status(200).json(fileNames);
            });
        } else {
            res.status(200).json({});
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.response ? error.response.data : "There was an issue on the server"
        });
    }
})
router.post('/', upload.single("file"), function (request, response) {
    //make thumbnails
    const saveLocation = savedFilesFolder + request.query.session;
    if (fs.existsSync(saveLocation)) {
        ffmpeg(saveLocation + '/' + request.query.filename)
            .setFfmpegPath(process.env.FFMPEG)
            .setFfprobePath(process.env.FFPROBE)
            .on('end', function () {
                response.status(200).send();
                //console.log('Screenshots taken');
            })
            .screenshots({
                count: request.query.p,
                filename: '%b.png',
                folder: saveLocation,
                size: '112x85'

            });
    } else if (!isValidFormat(request.query.filename)) {
        response.status(404).json({
            success: false,
            error: "Invalid file format"
        })
    }
});
router.delete('/:sessionId', function (request, response) {
    fs.unlinkSync(savedFilesFolder + request.params.sessionId);
    response.status(200).send();
});
module.exports = router;