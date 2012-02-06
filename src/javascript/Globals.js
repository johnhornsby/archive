var Globals = new function(){};
//Constants
Globals.CONSTRAINT_TWEEN_TIME = 0.75;
Globals.TILE_WIDTH = 113;
Globals.TILE_HEIGHT = 85;
Globals.ARTEFACT_IMAGES_FOLDER = "http://www.interactivelabs.co.uk/people/john/d2/images/";
Globals.OS_IOS = 1;
Globals.OS_OTHER = 0;



//Properties
Globals.artefactDataManager;
Globals.dataManager;
Globals.localStorageManager;
Globals.viewController;
Globals.planeController;
Globals.dockViewController;
Globals.deepLinkingManager;
Globals.imageLoadManager;

Globals.debug = true;
Globals.os = (navigator.userAgent.indexOf("iPad") != -1 ||  navigator.userAgent.indexOf("iPhone") != -1 ||  navigator.userAgent.indexOf("iPod") != -1) ? Globals.OS_IOS : Globals.OS_OTHER;

Globals.log = function(message){
	if(window.console && Globals.debug === true){
		console.log(message);
	}
}