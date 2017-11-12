const googlehome = require('google-home-notifier');
var deviceName = 'Google Home';
googlehome.device(deviceName);
googlehome.accent('en');


var os = require('os');
var myip;
os.networkInterfaces()['en0'].forEach(function(nic){
  if(nic['family'] == 'IPv4'){
    myip = nic['address'];
  }
});

if(myip){
	// 帰宅を検知したらGoogleHomeから音声を再生する
	googlehome.play('http://' + myip + ':8080/audio/お疲れ様でした', (notifyRes) => {
		console.log(notifyRes);
	});
}
