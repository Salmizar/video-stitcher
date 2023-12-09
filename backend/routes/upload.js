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
//Get Video Sessions File Details
router.get('/:sessionId', (req, res) => {
    try {
        let sessionFolder = savedFilesFolder + req.params.sessionId;
        if (fs.existsSync(sessionFolder)) {
            var fileNames = [];
            fs.readdir(sessionFolder, { withFileTypes: true }, (err, files) => {
                files.forEach(file => {
                    if (file.isFile()) {
                        fileNames.push({
                            "fileName": file.name
                        });
                    }
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
//Post Video File for processing
router.post('/', upload.single("file"), function (request, response) {
    console.log('called');
    //make thumbnails
    const saveLocation = savedFilesFolder + request.query.session;
    const numOfThumbs = Number(request.query.p);
    let timestamps = ["0%"];
    for (var i = 1; i < numOfThumbs - 1; i++) {
        timestamps.push(Math.round((100 / (numOfThumbs - 1)) * i) + "%");
    }
    if (numOfThumbs > 1) {
        timestamps.push("99.5%");//can't use 100%, some videos will not generate a thumb.
    }
    if (fs.existsSync(saveLocation)) {
        ffmpeg(saveLocation + '/' + request.query.filename)
            .setFfmpegPath(process.env.FFMPEG)
            .setFfprobePath(process.env.FFPROBE)
            .on('end', function () {
                response.status(200).send();
                //console.log('Screenshots taken');
            })
            .screenshots({
                timestamps: timestamps,
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