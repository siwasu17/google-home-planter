const flower = require("flower-power");

flower.discover((fp) => {
  console.log("FlowerPowerを見つけました。接続中です...");

  fp.connectAndSetup((err) => {
    if(err) return;
    console.log("接続しました。");
    fp.ledPulse((err) => {
      if(err)return;
    });

    fp.enableLiveMode((err) => {
      if(err) return;
      fp.on("soilMoistureChange",(sm) => {
        console.log("水: " + sm);	
      });
      fp.on("airTemperatureChange",(temp) => {
        console.log("気温: " + temp);	
      });
      fp.on("soilTemperatureChange",(temp) => {
        console.log("土温: " + temp);	
      });
	
      fp.on("sunlightChange",(sun) => {
        console.log("明るさ: " + sun);	
      });

    });

    fp.enableCalibratedLiveMode((err) => {
      if(err) return;
      fp.on("calibratedSoilMoistureChange",(sm) => {
        console.log("キャリブレ水: " + sm);	
      });
      fp.on("calibratedAirTemperatureChange",(temp) => {
        console.log("キャリブレ気温: " + temp);	
      });
      fp.on("calibratedSunlightChange",(sun) => {
        console.log("キャリブレ明るさ: " + sun);	
      });
    });
  });
});

