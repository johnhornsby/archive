var ImageLoadManager = function(){
	//Inheritance
	EventDispatcher.call(this);
	
	//Properties
	this._maxNumberOfDownloads = 10;
	this._currentNumberOfActiveDownloads = 0;
	this._srcToCallBackHashTable = {};
	this._srcQueue = [];
	this._srcLoading = [];
	this._srcLoaded = [];
	this._activeLoaders = [];
	this._inactiveLoaders = [];
	
	this._loadIncrement = 0;
	
	this._init();
};
//Inheritance
ImageLoadManager.prototype = new EventDispatcher();

ImageLoadManager.IMAGELOADED = "imageLoaded";



//PRIVATE
//_____________________________________________________________________________________________
ImageLoadManager.prototype._init = function(){
	var i = this._maxNumberOfDownloads;
	var imageLoader;
	while(i--){
		imageLoader = new Image();
		$(imageLoader).bind("load",this._onLoadComplete.context(this));
		$(imageLoader).bind("error",this._onLoadError.context(this));
		
		this._inactiveLoaders.push(imageLoader);
	}
};

ImageLoadManager.prototype._onLoadComplete = function(e){
	
	var identifier = e.currentTarget.identifier;
	console.log("loaded "+identifier);
	var src = e.currentTarget.src;
	var imageLoadObject = this._srcToCallBackHashTable[identifier];

	var index = this._srcLoading.indexOf(identifier);
	this._srcLoaded.push(this._srcLoading.splice(index,1)[0]);
	
	if(index == -1){
		console.log("no index");
	}
	
	if(imageLoadObject === undefined){
		console.log("_onLoadComplete: call back already deleted");
	}else{
		//perform callback, with displayObject
		imageLoadObject.callback(imageLoadObject.param,src);
		//delete callback object data
		this._srcToCallBackHashTable[identifier] = undefined;
		delete this._srcToCallBackHashTable[identifier];
	}

	//deactivate loader
	var loaderIndex = this._activeLoaders.indexOf(e.currentTarget);
	this._inactiveLoaders.push(this._activeLoaders.splice(loaderIndex,1)[0]);
	//check
	this._checkIdReadyToLoad();
};

ImageLoadManager.prototype._onLoadError = function(e){
	var identifier = e.currentTarget.identifier;
	console.log("error "+identifier);
};

ImageLoadManager.prototype._checkIdReadyToLoad = function(){
	var identifier;
	var src;
	if(this._inactiveLoaders.length > 0){
		if(this._srcQueue.length > 0){
			var loader = this._inactiveLoaders.shift();
			this._activeLoaders.push(loader);
			identifier = this._srcQueue.splice(0,1)[0];
			try{
				src = this._srcToCallBackHashTable[identifier].src;
			}catch(e){
				console.log("ahsh");
			}
			loader.src = src;
			loader.identifier = identifier;
			this._srcLoading.push(identifier);
		}
	}
};






//PUBLIC
//_____________________________________________________________________________________________
ImageLoadManager.prototype.requestImageLoad = function(src,callback,param){
	if(param == undefined){
		console.log("no param");
	}
	this._loadIncrement ++;
	var identifier = "_"+this._loadIncrement;
	
	this._srcQueue.push(identifier);
	this._srcToCallBackHashTable[identifier] = {callback:callback,param:param,src:src};
	this._checkIdReadyToLoad();
	return identifier;
}

/**
* Cancels a request to load image, so if its in the queue it is removed, called from TileEngine when displayObject is about to be dequeued.
* preloaded displayObjects should not call cancelRequestedImageLoad once it has been downloaded.
*/
ImageLoadManager.prototype.cancelRequestedImageLoad = function(identifier){	
	//remove form queue
	console.log("cancelRequestedImageLoad "+identifier);
	var index = this._srcQueue.indexOf(identifier);
	if(index > -1){
		this._srcQueue.splice(index,1);
		//remove callback
		this._srcToCallBackHashTable[identifier] = undefined;
		delete this._srcToCallBackHashTable[identifier];
	}else if(this._srcLoading.indexOf(identifier) > -1){
		console.log("cancel  but already loading");
	}

}





/*
//EVENT CLASS
//_________________________________________________________________________________________	
var ImageLoadManagerEvent = function(eventType,data){
	this.eventType = eventType;
	this.data = data;
};
ImageLoadManagerEvent.IMAGE_LOADED = "imageLoaded";
*/