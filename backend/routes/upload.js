const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const savedFilesFolder = process.env.SAVED_FILES_FOLDER;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const saveLocation = savedFilesFolder + req.query.session;
        if (!fs.existsSync(saveLocation)) {
            fs.mkdirSync(saveLocation);
        }
        cb(null, saveLocation);
    },
    filename: function (req, file, cb) {
        cb(null, req.query.filename);
    }
});
const upload = multer({ storage: storage });
/*router.get('/', (req, res) => {
    try {
        var fileNames = [];
        fs.readdir(savedFilesFolder, (err, files) => {
            files.forEach(file => {
                fileNames.push({
                "name": file.substring(0,file.lastIndexOf('.')),
                "fileName": file
            });
            });
            res.status(200).json(fileNames);
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.response ? error.response.data : "There was an issue on the server"
        })
    }
})*/
router.post('/', upload.single("file"), function (request, response) {
    //make thumbnails
    const saveLocation = savedFilesFolder + request.query.session;
    ffmpeg(saveLocation + '/' + request.query.filename)
        .setFfmpegPath(process.env.FFMPEG)
        .setFfprobePath(process.env.FFPROBE)
        .on('end', function () {
            response.status(200).send();
            //console.log('Screenshots taken');
        })
        .screenshots({
            count: 5,
            filename: '%b.png',
            folder: saveLocation
        });
});
router.delete('/', function (request, response) {
    fs.unlinkSync(savedFilesFolder + request.query.fileName);
    response.status(200).send();
});
module.exports = router;