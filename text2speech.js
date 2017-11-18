/**
 * 音声合成APIを叩いて音声ファイルを返却するサーバー
 */
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const request = require('request');
const exec = require('child_process').exec;

const app = express();
const serverPort = 8080;
const urlencodedParser = bodyParser.urlencoded({ extended: false }); 

//SSMLを生成
//See: https://dev.smt.docomo.ne.jp/?p=docs.api.page&api_name=text_to_speech&p_name=api_1
function buildSSML(speaker, text){
	return '<?xml version="1.0" encoding="utf-8" ?><speak version="1.1"><voice name="' + speaker + '">' + text + '</voice></speak>';
}

// CORSを許可
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/audio/:text', (req, res) => {
  const MAX_BUFFER_SIZE = 2000*1024;
	var text = req.params.text;
	if (!text) {
		res.status(400).send('Invalid Parameters.');
	}

  console.log(text);

	exec('./get_speech.sh ' + text,  {maxBuffer: MAX_BUFFER_SIZE}, (err, stdout, stderr) => {
		if (err) { console.log(err); }
	  file = fs.readFileSync(__dirname + '/audio/a.wav', 'binary');
		res.setHeader('Content-Length', file.length);
		res.write(file, 'binary');
		res.end();
	});

});

app.listen(serverPort, () => {
	console.log(`Start text to speech server. Port is ${serverPort}`);
})
