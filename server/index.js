const express = require("express");
const cors = require('cors')
const app = express()
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const fs = require('fs')
const multer = require('multer');

require('dotenv').config();

const { substringLetters } = require('./utils/substringLetters')

app.use(cors())
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", (req, res) => {
    res.status(200).send("Hello World!");
});

app.post('/api/recognize', multer({ dest: 'tmp/' }).single('file'), (req, res) => {
    const speechToText = new SpeechToTextV1({
        authenticator: new IamAuthenticator({
            apikey: `${process.env.SPEECH_TO_TEXT_APIKEY}`,
        }),
        serviceUrl: `${process.env.SPEECH_TO_TEXT_URL}`,
    });

    console.log(req.file)
    console.log(req.body.model)
    console.log(req.body)


    var parameters = {
        model: req.body.model,
        audio: fs.createReadStream(req.file.path),
        contentType: req.body.file_mimetype,
        timestamps: req.body.timestamps,
        interimResults: true,
        smartFormatting: true,
        
    };

    if(req.body.keywords !== ''){
        parameters.keywords = req.body.keywords.split(',')
        parameters.keywordsThreshold = req.body.keywordsThreshold
    }


    speechToText.recognize(parameters)
    .then(recognizeResult => {
        console.log(recognizeResult)
        var resObject = recognizeResult.result
        const transcriptByInterim = resObject.results?.map((result) => (result.alternatives[0]?.transcript))

        var transcript = ""

        resObject.results?.forEach((result) => {
            transcript = transcript + result.alternatives[0]?.transcript.split(' ').join('')
        })
        console.log(transcript)

        var detects = {}

        if(req.body.keywords !== ''){
            const RANGE = 5
            detects = substringLetters(transcript, req.body.keywords.split(','), resObject, RANGE) || {}
            console.log(detects)
        }

        const returnedObject = {
            speechToTextResult: resObject,
            transcript,
            transcriptByInterim,
            detects
        }

        res.send(returnedObject)
    })
    .catch(err => {
        console.log('ERROR:' + err);
        res.status(500).send(`サーバ側でエラーが発生しました(${err})`);
    })
    
})

module.exports = app;

// app.listen(8080, () => {
//     console.log('### CALLBACK: listening port 8080 ###')
// })