const googlehome = require('google-home-notifier');
const os = require('os');
const flower = require('flower-power');

var deviceName = 'Google Home';
googlehome.device(deviceName);
googlehome.accent('ja');

var myip;
os.networkInterfaces()['en0'].forEach(function(nic){
  if(nic['family'] == 'IPv4'){
    myip = nic['address'];
  }
});

var greatedDate = {};


function getYMD(){
  var dt = new Date();
	var year = dt.getFullYear();
	var month = dt.getMonth()+1;
	var date = dt.getDate();
	return "" + year + month + date;
}

var greatedDate = {};

const watchInterval = 300000;
setInterval(function() {
  var ymd = getYMD();
	if(ymd in greatedDate){
		console.log("今日はもう挨拶しました " + ymd);
		return;
	}

	console.log('FlowerPowerを探しています...');
	flower.discover((fp) => {
		console.log('FlowerPowerを見つけました。接続中です...');
		fp.connectAndSetup((err) => {
			if(err) return;
			console.log('接続しました。');
			fp.readSunlight((err, sunlight) => {
				if(err) console.log("照度取得エラー");
				console.log('照度は'+sunlight+'です。');
				if(sunlight > 0.3){
					if(myip){
						var text = "おはようございます";
						googlehome.play('http://' + myip + ':8080/audio/' + text, (notifyRes) => {
							console.log(notifyRes);
						}); 
						greatedDate[ymd] = 1;
					}
				}else{
					//起動条件を満たさなかったら切断して終わる
					fp.disconnect((err) => {
						if(err) console.log(err);
						console.log("FolowerPowerを切断しました");
						return;
					});
				}
			}); 
		}); 
	});
}, watchInterval);
