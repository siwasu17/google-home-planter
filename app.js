const googlehome = require("google-home-notifier");
let deviceName = "Google Home";
googlehome.device(deviceName);
googlehome.accent("ja");

let myip;
const os = require("os");
os.networkInterfaces()["en0"].forEach(function(nic){
  if(nic["family"] == "IPv4"){
    myip = nic["address"];
  }
});

const flower = require("flower-power");

const getYMD = function(){
  let dt = new Date();
  let year = dt.getFullYear();
  let month = dt.getMonth()+1;
  let date = dt.getDate();
  return "" + year + month + date;
};

//
let greatedDate = {};
//夜時間帯を定義
let nightStartHour = 21;
let nightEndHour = 23;

const watchInterval = 300000;
setInterval(function() {
  let dt = new Date();
  let h = dt.getHours();
  console.log("起動... " + dt);

  if(h < nightStartHour || h > nightEndHour){
    console.log("まだ夜ではありません zzz");
    return;
  }

  let ymd = getYMD();
  if(ymd in greatedDate){
    console.log("今日はもう挨拶しました ^^" + ymd);
    return;
  }

  console.log("FlowerPowerを探しています...");
  flower.discover((fp) => {
    console.log("FlowerPowerを見つけました。接続中です...");
    fp.connectAndSetup((err) => {
      if(err) return;
      console.log("接続しました。");
      fp.enableLiveMode((err) => {
        if(err)return;
        console.log("ライブモードを開始します");
        fp.on("sunlightChange", (sunlight) => {
          console.log(sunlight);
          let current = new Date();
          if(current.getHours() > nightEndHour){

            //起動条件を満たさなかったら切断して終わる
            fp.disconnect((err) => {
              if(err) console.log(err);
              console.log("FolowerPowerを切断しました");
              return;
            });
          }

          if(sunlight > 0.3){
            if(myip){
              let text = "おかえりなさい。今日もおつかれさまでした。";
              googlehome.play("http://" + myip + ":8080/audio/" + text, (notifyRes) => {
                console.log(notifyRes);
              }); 
              greatedDate[ymd] = 1;
            }
          }
        });
      });
    }); 
  });
}, watchInterval);
