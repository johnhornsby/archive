var ImageLoadManager = function(){
	//Inheritance
	EventDispatcher.call(this);
	
	//Properties
	this._maxNumberOfDownloads = 1;
	this._currentNumberOfActiveDownloads = 0;
	this._srcToCallBackHashTable = {};
	this._srcQueue = [];
	this._activeLoaders = [];
	this._inactiveLoaders = [];
	
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
		this._inactiveLoaders.push(imageLoader);
	}
};

ImageLoadManager.prototype._onLoadComplete = function(e){
	var src = e.currentTarget.src;
	//perform callback, with displayObject
	this._srcToCallBackHashTable[src].callback(this._srcToCallBackHashTable[src].param,src);
	//delete callback object data
	this._srcToCallBackHashTable[src] = undefined;
	delete this._srcToCallBackHashTable[src];
	//deactivate loader
	var loaderIndex = this._activeLoaders.indexOf(e.currentTarget);
	this._inactiveLoaders.push(this._activeLoaders.splice(loaderIndex)[0]);
	//check
	this._checkIdReadyToLoad();
};

ImageLoadManager.prototype._onLoadError = function(e){
	
};



ImageLoadManager.prototype._checkIdReadyToLoad = function(){
	if(this._inactiveLoaders.length > 0){
		if(this._srcQueue.length > 0){
			var loader = this._inactiveLoaders.shift();
			this._activeLoaders.push(loader);
			loader.src = this._srcQueue.splice(0,1)[0];
		}
	}
};






//PUBLIC
//_____________________________________________________________________________________________
ImageLoadManager.prototype.requestImageLoad = function(src,callback,param){
	this._srcQueue.push(src);
	this._srcToCallBackHashTable[src] = {callback:callback,param:param};
	this._checkIdReadyToLoad();
}

/**
* Cancels a request to load image, so if its in the queue it is removed, called from TileEngine when displayObject is about to be dequeued.
* preloaded displayObjects should not call cancelRequestedImageLoad once it has been downloaded.
*/
ImageLoadManager.prototype.cancelRequestedImageLoad = function(src){	
	//remove form queue
	var index = this._srcQueue.indexOf(src);
	if(index >- 1){
		this._srcQueue.splice(index,1);
	}
	//remove callback
	this._srcToCallBackHashTable[src] = undefined;
	delete this._srcToCallBackHashTable[src];
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