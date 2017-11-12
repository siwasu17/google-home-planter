const googlehome = require('google-home-notifier');
const os = require('os');

var deviceName = 'Google Home';
googlehome.device(deviceName);
googlehome.accent('ja');

var myip;
os.networkInterfaces()['en0'].forEach(function(nic){
  if(nic['family'] == 'IPv4'){
    myip = nic['address'];
  }
});


googlehome.play('http://' + myip + ':8080/googlehome/otu.mp3', (notifyRes) => {
		console.log(notifyRes);
});
