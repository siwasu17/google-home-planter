/**
 * 音声合成APIを叩いて音声ファイルを返却するサーバー
 */
const express = require("express");
const fs = require("fs");
const exec = require("child_process").exec;

const app = express();
const serverPort = 8080;

// CORSを許可
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/audio/:text", (req, res) => {
  let text = req.params.text;
  if (!text) {
    res.status(400).send("Invalid Parameters.");
  }

  console.log("Received text:" + text);

  const MAX_BUFFER_SIZE = 2000*1024;
  exec("./get_speech.sh " + text,  {maxBuffer: MAX_BUFFER_SIZE}, (err, stdout, stderr) => {
    if (err) { console.log(err); return; }
    const file = fs.readFileSync(__dirname + "/audio/voice.wav", "binary");
    res.setHeader("Content-Length", file.length);
    res.write(file, "binary");
    res.end();
  });

});

app.listen(serverPort, () => {
  console.log(`Start text to speech server. Port is ${serverPort}`);
});
