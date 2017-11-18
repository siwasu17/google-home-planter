const googlehome = require("google-home-notifier");
let deviceName = "Google Home";
googlehome.device(deviceName);
googlehome.accent("ja");

let os = require("os");
let myip;
os.networkInterfaces()["en0"].forEach(function(nic){
  if(nic["family"] == "IPv4"){
    myip = nic["address"];
  }
});

if(myip){
  // APIのレスポンスURLをgoogle homeに伝える
  googlehome.play("http://" + myip + ":8080/audio/お疲れ様でした", (notifyRes) => {
    console.log(notifyRes);
  });
}
