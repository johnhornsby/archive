var DeepLinkingManager = function(){
	EventDispatcher.call(this);
	
	this._path = "/";
	this._internalEventTimer = 301;
	
	this.init();
};
//Inheritance
DeepLinkingManager.prototype = new EventDispatcher();




/**
* init add event listener to SWFAddress object, uses CHANGE rather than EXTERNAL_CHANGE and INTERAL_CHANGE as 
* I have experienced different behaviour between browsers, with IE sometimes calling the INTERNAL_CHANGE event.
* @private
*/
DeepLinkingManager.prototype.init = function(){
	SWFAddress.addEventListener(SWFAddressEvent.CHANGE, this.onChangeHandler.context(this));
};

/**
* Event handler called when SWFAddress registers a change to the address. A check is carried out to ensure
* that we ignore this event if it called less than 300 milliseconds after calling setAddress() which sets the 
* address via SWFAddress.setValue this can generate an change event causing problems.
* @private
*/
DeepLinkingManager.prototype.onChangeHandler = function(e){
	var timeSince = new Date().getTime() - this._internalEventTimer;
	if(timeSince > 300){
		//console.log('DeepLinkingManager genuine onChangeHandler:'+e.path);
		this.checkAddress();
	}
};






//PUBLIC
//_________________________________________________________________________________________
/**
* Methods checks address and determins whether a change has occured, if so then we dispatch an update date event.
* This is utilised within this, and called from ViewController to determin on startup whether their is an address.
*/
DeepLinkingManager.prototype.checkAddress = function(){
	var path = SWFAddress.getValue();
	
	if( this._path !== path ){
		this._path = path;
		this.dispatchEvent(new DeepLinkingManagerEvent(DeepLinkingManagerEvent.UPDATE_ADDRESS, path));
	}
};

/**
* Function sets the address internally, so for example when the Arefact Window is opened
*/
DeepLinkingManager.prototype.setAddress = function(path){
	if(this._path !== path){
		//console.log('DeepLinkingManager setAddress');
		this._path = path;
		this._internalEventTimer = new Date().getTime();
		SWFAddress.setValue(path);
	}
};

/**
* Function called by ViewController to check address after InfoWindow has been closed
*/
DeepLinkingManager.prototype.getAddress = function(){
	return this._path;
};





//Event Classes
//_________________________________________________________________________________________	
var DeepLinkingManagerEvent = function(eventType,path){
	this.eventType = eventType;
	this.path = path;
};
DeepLinkingManagerEvent.UPDATE_ADDRESS = "updateAddress";