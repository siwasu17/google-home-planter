//Google Home Notifierの準備
const googlehome = require("google-home-notifier");
let deviceName = "Google Home";
googlehome.device(deviceName);
googlehome.accent("ja");

//Flower Powerモジュールの準備
const flower = require("flower-power");

//このマシンのIPアドレスを取得
let myip;
const os = require("os");
os.networkInterfaces()["en0"].forEach(function(nic){
  if(nic["family"] == "IPv4"){
    myip = nic["address"];
  }
});

//ロガー準備
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug';

//時間取扱ライブラリ準備
let moment = require("moment");

//多重起動させないためのフラグ
//動作が完了した日付
let greatedDate = {};
//すでに動作中かどうか
let alreadyRunning = false;
//起動する明るさの閾値
const LIGHT_THRESHOLD = 0.3;

//夜の時間帯か判定
const isNight = function(currentMoment){
  logger.info(currentMoment);
  let nightStart = moment({hours: 20, minutes: 00});
  let nightEnd = moment({hours: 23, minutes: 30});

  if(currentMoment.diff(nightStart) > 0 && currentMoment.diff(nightEnd) < 0){
    return true;
  }
  return false;
}


//一定間隔毎に起動チェックして、条件を満たしたらセンサーを動かし始める
const interval = 5000;
setInterval(function() {
  logger.info("起動チェック中...");
  let current = moment();
  //夜でなければすぐ終了
  if(!isNight(current) ){
    logger.info("まだ夜ではありません zzz");
    return;
  }

  //すでに今日の動作は終わっているか
  if(current.format("YYYYMMDD") in greatedDate){
    logger.info("今日はもう挨拶しました");
    return;
  }

  //先行したプロセスが動いているか確認
  if(alreadyRunning){
    logger.info("すでに起動しています");
    return;
  }

  logger.info("起動開始");
  alreadyRunning = true;
  logger.info("FlowerPowerを探しています...");

  flower.discover((fp) => {

    logger.info("FlowerPowerを見つけました。接続中です...");

    fp.connectAndSetup((err) => {
      if(err) return;

      logger.info("接続しました");

      fp.enableLiveMode((err) => {
        if(err)return;

        logger.info("ライブモードを開始します");
        isLiveMode = true;

        //照度センサーを監視して、明るくなったら動作する
        fp.on("sunlightChange", (sunlight) => {
          logger.info("照度; " + sunlight);

          //ライブモード中に夜時間帯を越えていたら終了する
          if(!isNight(moment())){
            logger.info("指定の時間帯を越えたので終了します");
            alreadyRunning = false;
            fp.disconnect((err) => { return; });
          }

          if(sunlight > LIGHT_THRESHOLD){
            if(myip){
              let text = "おかえりなさい。今日もおつかれさまでした。";
              googlehome.play("http://" + myip + ":8080/audio/" + text, (notifyRes) => {
                logger.info(notifyRes);
              });
              greatedDate[moment().format("YYYYMMDD")] = 1;

              //終了
              logger.info("ライブモードを終了します");
              fp.disableLiveMode((err) => {
                fp.disconnect((err) => { return; });
                return;
              });
            }
          }
        });
      });
    }); 
  });
}, interval);
