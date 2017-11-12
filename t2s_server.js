/**
 * 音声発話APIを叩いて音声ファイルを返却するサーバー
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

//文字列のバイト数を取るため
String.prototype.bytes = function () {
  return(encodeURIComponent(this).replace(/%../g,"x").length);
}

function getSpeech(speaker, text){
	var APIKEY = "68796153587a4f73724b4b6653664b556d6f6f465a34744534457a4f302f626f4b49726a4551596d4b2e43";
	var ssml = buildSSML(speaker, text);
  var ssmlLen = ssml.bytes();
//  console.log("SSML; " + ssml);
//  console.log("LEN: " + ssmlLen);
	var options = {
		uri: "https://api.apigw.smt.docomo.ne.jp/aiTalk/v1/textToSpeech?APIKEY=" + APIKEY,
		headers: {
			"Accept": "audio/L16",
			"Content-type": "application/ssml+xml",
			"Content-Length": ssmlLen
		},
    body: ssml
	};
  request.post(options, function(error, response, body){
		fs.writeFileSync("a.raw", body, { encoding: null });
  });
}


// CORSを許可
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/audio/:text', (req, res) => {
	const text = req.params.text;
	if (!text) {
		res.status(400).send('Invalid Parameters.');
	}

//TODO: あとで任意の文字列を変換するように変更する
	exec('./get_speech.sh',  {maxBuffer: 1000*1024}, (err, stdout, stderr) => {
		if (err) { console.log(err); }
		console.log("完了");
	  file = fs.readFileSync(__dirname + '/audio/a.wav', 'binary');
		res.setHeader('Content-Length', file.length);
		res.write(file, 'binary');
		res.end();
	});

});

app.listen(serverPort, () => {
	console.log(`Start api-server. Port is ${serverPort}`);
})
