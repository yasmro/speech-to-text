const request = require("supertest");
const app = require("./index");
const fs = require('fs');

describe("Example Test", () => {
    test("It should response the GET method with 200.", done => {
        request(app).get("/")
            .then(response => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});

describe("file upload path", () => {
    test("It should response the POST method", done => {
        var params = new FormData();
        params.append('file', fs.readFileSync("/public/audio/ja-JP_BroadbandModel.wav"))
        params.append('model', 'ja-JP_BroadbandModel')
        params.append('timestamps', true)
        params.append('keywords', '音声認識,ディープ')
        params.append('keywordsThreshold', 0.6)

        request(app).post("/api/recognize")
            .send(params) // POSTデータ
            .set('Accept', 'multipart/form-data')
            .then(response => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});