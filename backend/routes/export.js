const express = require('express');
const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const savedFilesFolder = process.env.SAVED_FILES_FOLDER;
const outputFldr = '/output';
router.get('/:sessionId', async (req, res) => {
    const saveLocation = savedFilesFolder + req.params.sessionId;
    const dimensions = req.query.width + 'x' + req.query.height;
    const aspect = Number(req.query.width) / Number(req.query.height);
    try {
    makeDirectories(saveLocation+outputFldr+'/tmp');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.write("stage:1");
    await trimVideo(saveLocation, req.query.v1filename, req.query.v1start, req.query.v1end, dimensions, aspect);
    res.write("stage:2");
    await trimVideo(saveLocation, req.query.v2filename, req.query.v2start, req.query.v2end, dimensions, aspect);
    res.write("stage:3");
    await combineVideos(saveLocation, req.query.v1filename, req.query.v2filename);
    //clean up temp files
    deleteFile(saveLocation + outputFldr+'/t-' + req.query.v1filename);
    deleteFile(saveLocation + outputFldr+'/t-' + req.query.v2filename);
    res.write("stage:4");
    res.end();
    } catch (error) {
        console.log('error processing files');
        res.write("error");
        res.end();
    }
})
const deleteFile = (file) => {
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
    }
}
const makeDirectories = (dir) => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
}
const combineVideos = (saveLocation, video1, video2) => {
    return new Promise((resolve) => {
        console.log('tempFolder', saveLocation +outputFldr+'/tmp');
        ffmpeg(saveLocation + outputFldr+'/t-' + video1)
            .setFfmpegPath(process.env.FFMPEG)
            .setFfprobePath(process.env.FFPROBE)
            .addInput(saveLocation + outputFldr+'/t-' + video2)
            .on("start", function (commandLine) {
                console.log("Spawned FFmpeg with command: " + commandLine);
            })
            .on("error", function (err) {
                console.log("error: ", +err.message);
            })
            .on("end", function (err) {
                if (!err) {
                    resolve();
                }
            })
            .mergeToFile(saveLocation + outputFldr+'/output.mp4', saveLocation +outputFldr+'/tmp');
    });
}
const trimVideo = (saveLocation, video, start, end, dimensions, aspect) => {
    return new Promise((resolve) => {
        ffmpeg(saveLocation + '/' + video)
            .setFfmpegPath(process.env.FFMPEG)
            .setFfprobePath(process.env.FFPROBE)
            .fps(30)
            .size(dimensions)
            .setStartTime(start)
            .setDuration(end)
            .audioCodec('libmp3lame')
            .videoCodec('libx264')
            .aspect(aspect).autopad('black')
            .on("start", function (commandLine) {
                console.log("Spawned FFmpeg with command: " + commandLine);
            })
            .on("error", function (err) {
                console.log("error: ", +err);
            })
            .on("end", function (err) {
                if (!err) {
                    resolve();
                }
            })
            .saveToFile(saveLocation + outputFldr+'/t-' + video);
    })
}
module.exports = router;