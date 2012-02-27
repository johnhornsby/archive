var Globals = new function(){};
//Constants
Globals.CONSTRAINT_TWEEN_TIME = 0.75;
Globals.TILE_WIDTH = 113;
Globals.TILE_HEIGHT = 85;
Globals.ARTEFACT_IMAGES_FOLDER = "http://www.interactivelabs.co.uk/people/john/d2/images/";
Globals.OS_IOS = 1;
Globals.OS_OTHER = 0;
Globals.BROWSER_WEBKIT = 0;
Globals.BROWSER_IE = 1;
Globals.BROWSER_OTHER = 2;
Globals.SEARCH_PROMPT = "search for keyword";



//Properties
Globals.artefactDataManager;
Globals.dataManager;
Globals.localStorageManager;
Globals.viewController;
Globals.planeController;
Globals.dockViewController;
Globals.deepLinkingManager;
Globals.imageLoadManager;
Globals.windowWidth;
Globals.windowHeight;


Globals.debug = true;
//Globals.os = (navigator.userAgent.indexOf("iPad") != -1 ||  navigator.userAgent.indexOf("iPhone") != -1 ||  navigator.userAgent.indexOf("iPod") != -1) ? Globals.OS_IOS : Globals.OS_OTHER;
Globals.isDesktop;
Globals.isRetinaDisplay;
Globals.browser;
Globals.browserVersion;
Globals.os;

/**
* Inititated by Main.js
*/
Globals.init = function(){
	Globals.isDesktop = SEQ.utils.browser.platform.isDesktop();
	Globals.isRetinaDisplay = SEQ.utils.browser.platform.isRetinaDisplay();
	BrowserDetect.init();
	Globals.browser = BrowserDetect.browser;
	Globals.browserVersion = BrowserDetect.version;
	Globals.os = BrowserDetect.OS;
}

Globals.log = function(message){
	if(window.console && Globals.debug === true){
		console.log(message);
	}
}