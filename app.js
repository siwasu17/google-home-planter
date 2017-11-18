//Google Home Notifierの準備
const googlehome = require("google-home-notifier");
let deviceName = "Google Home";
googlehome.device(deviceName);
googlehome.accent("ja");

//Flower Powerモジュールの準備
const flower = require("flower-power");

//ロガー準備
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'info';

//このマシンのIPアドレスを取得
let myip;
const os = require("os");
os.networkInterfaces()["en0"].forEach(function(nic){
  if(nic["family"] == "IPv4"){
    myip = nic["address"];
  }
});

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
  let nightStart = moment({hours: 20, minutes: 00});
  let nightEnd = moment({hours: 23, minutes: 30});

  if(currentMoment.diff(nightStart) > 0 && currentMoment.diff(nightEnd) < 0){
    return true;
  }
  return false;
}

//気温に応じたメッセージ
const getTemperatureMessage = function(temperature){
  let message = "今日は";
  if(temperature < 15){
    message += "とても寒い";
  }else if(temperature < 20){
    message += "はだ寒い";
  }else if(temperature < 25){
    message += "過ごしやすい";
  }else{
    message += "あつい";
  }
  return message + "一日だったね。";
}

//土の水分に応じたメッセージ
const getMoistureMessage = function(moisture){
  let message = "";
  if(moisture < 20){
    message += "そろそろお水が欲しいかも。";
  }else if(moisture < 50){
    message += "お水はちょうどよいかんじ。";
  }else{
    message += "ちょっと水が多すぎるかも。";
  }
  return message;
}

//GoogleHomeにしゃべってもらう
const sayMessage = function(message){
  googlehome.play("http://" + myip + ":8080/audio/" + message, (notifyRes) => {
    logger.info(notifyRes);
  });
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

  logger.info("夜になりました。起動します");
  alreadyRunning = true;

  logger.info("FlowerPowerを探しています...");

  flower.discover((fp) => {

    logger.info("FlowerPowerを見つけました。接続中です...");

    fp.connectAndSetup((err) => {
      if(err) return;

      logger.info("接続しました");
      //LED光らせる
      fp.ledPulse((err) => { if(err)return; }); 

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

          if(current.format("YYYYMMDD") in greatedDate){
            //音声再生中にもイベントが来てしまうので、多重動作対策
            return;
          }

          if(sunlight > LIGHT_THRESHOLD){
            logger.info("帰宅を検知しました");
            fp.ledPulse((err) => { if(err)return; }); 

            //本日の音声再生シーケンスに入ったのでフラグを立てる
            greatedDate[moment().format("YYYYMMDD")] = 1;

            let text = "おかえりなさい。";

            //温度チェック
            fp.readAirTemperature((err, temperature) => {
              if(err)return;
              text += getTemperatureMessage(temperature);

              //水分チェック
              fp.readSoilMoisture((err, moisture) => {
                text += getMoistureMessage(moisture);
                //植木鉢の状態をもとにメッセージを構築してGoogleHomeからしゃべる
                sayMessage(text);
              });
            });

            //終了
            logger.info("ライブモードを終了します");
            fp.disableLiveMode((err) => {
              fp.disconnect((err) => { return; });
              return;
            });
          }
        });
      });
    }); 
  });
}, interval);
