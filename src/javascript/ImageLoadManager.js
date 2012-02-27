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
	this._timeoutTimer;
	this._loaderTimeoutHistory = [{}];
	
	this._loadIncrement = 0;
	
	this._init();
};
//Inheritance
ImageLoadManager.prototype = new EventDispatcher();

ImageLoadManager.IMAGELOADED = "imageLoaded";
ImageLoadManager.TIME_OUT = 15000;


//PRIVATE
//_____________________________________________________________________________________________
ImageLoadManager.prototype._init = function(){
	var i = this._maxNumberOfDownloads;
	var imageLoader;
	while(i--){
		imageLoader = new Image();
		$(imageLoader).bind("load",this._onLoadComplete.context(this));
		$(imageLoader).bind("error",this._onLoadError.context(this));
		$(imageLoader).bind("abort",this._onAbortError.context(this));
		this._inactiveLoaders.push(imageLoader);
	}
	this._timeoutTimer = setInterval(this._checkForTimeouts.context(this),2000);
};

ImageLoadManager.prototype._onLoadComplete = function(e){
	
	var identifier = e.currentTarget.identifier;
	//Globals.log("loaded "+identifier);
	var src = e.currentTarget.src;
	
	//get image object from hashtable, maybe undefined, if cancelled
	var imageLoadObject = this._srcToCallBackHashTable[identifier];
	var result = " success";
	
	if(imageLoadObject === undefined){
		//Globals.log("_onLoadComplete: call back already deleted");
		result = " cancelled while loading";
	}else{
		//perform callback, with displayObject
		imageLoadObject.callback(imageLoadObject.param,src);
		//delete callback object data
		this._deleteIdentifierFromHashTable(identifier);
	}
	//move identifier to loaded array from loading for logging
	this._moveLoadingIdentifierToLoaded(identifier, result);
	//deactivate image loader
	this._deactivateLoader(e.currentTarget);
	//check for next
	this._checkIdReadyToLoad();
};

ImageLoadManager.prototype._onLoadError = function(e){
	var identifier = e.currentTarget.identifier;
	//Globals.log("error "+identifier);
};

ImageLoadManager.prototype._onAbortError = function(e){
	var identifier = e.currentTarget.identifier;
	//Globals.log("abort "+identifier);
};

ImageLoadManager.prototype._checkIdReadyToLoad = function(){
	var identifier;
	var src;
	if(this._inactiveLoaders.length > 0){
		if(this._srcQueue.length > 0){
			var loader = this._inactiveLoaders.shift();
			this._activeLoaders.push(loader);
			identifier = this._srcQueue.splice(0,1)[0];
			src = this._srcToCallBackHashTable[identifier].src;
			loader.identifier = identifier;
			this._srcLoading.push(identifier);
			loader.src = src;									//set source only after everything is ready, problems occured in IE8 due to the load event being immediately called as soon as the src was set, before the identifier was overwritten
		}
	}
};

ImageLoadManager.prototype._checkForTimeouts = function(){
	var decrement = this._activeLoaders.length;
	var loader;
	var identifier;
	var previousHistoryObject;
	var nowHistoryObject;
	var time;
	var nowTime;
	
	if(decrement > 0){
		previousHistoryObject = this._loaderTimeoutHistory.pop();
		nowHistoryObject = {}
		nowTime = new Date().getTime();
		while(decrement--){
			loader = this._activeLoaders[decrement];
			identifier = loader.identifier;
			time = previousHistoryObject[identifier];
			
			if(time !== undefined){
				if(nowTime - time > ImageLoadManager.TIME_OUT){
					//Globals.log("Timeout identifier:"+identifier);
					this._deleteIdentifierFromHashTable(identifier);
					this._moveLoadingIdentifierToLoaded(identifier, " timeout");
					loader.src = "";
					this._deactivateLoader(loader);
					this._checkIdReadyToLoad();
				}else{
					nowHistoryObject[identifier] = time;			//copy across the time to new time snapshot
				}
			}else{
				nowHistoryObject[identifier] = nowTime;
			}
		}
		this._loaderTimeoutHistory.push(previousHistoryObject);
		this._loaderTimeoutHistory.push(nowHistoryObject);
	}
}

ImageLoadManager.prototype._deactivateLoader = function(activeLoader){
	//activeLoader.src = "";
	var loaderIndex = this._activeLoaders.indexOf(activeLoader);
	this._inactiveLoaders.push(this._activeLoaders.splice(loaderIndex,1)[0]);
}

ImageLoadManager.prototype._moveLoadingIdentifierToLoaded = function(identifier, result){
	var index = this._srcLoading.indexOf(identifier);
	this._srcLoaded.push(this._srcLoading.splice(index,1)[0] + result);
}
ImageLoadManager.prototype._deleteIdentifierFromHashTable = function(identifier){
	this._srcToCallBackHashTable[identifier] = undefined;
	delete this._srcToCallBackHashTable[identifier];
}

//PUBLIC
//_____________________________________________________________________________________________
ImageLoadManager.prototype.requestImageLoad = function(identifier,src,callback,param){
	this._srcQueue.push(identifier);
	this._srcToCallBackHashTable[identifier] = {callback:callback,param:param,src:src};
	this._checkIdReadyToLoad();
}

/**
* Cancels a request to load image, so if its in the queue it is removed, called from TileEngine when displayObject is about to be dequeued.
* preloaded displayObjects should not call cancelRequestedImageLoad once it has been downloaded.
*/
ImageLoadManager.prototype.cancelRequestedImageLoad = function(identifier){	
	//remove form queue
	//Globals.log("cancelRequestedImageLoad "+identifier);
	var index = this._srcQueue.indexOf(identifier);
	if(index > -1){
		this._srcQueue.splice(index,1);	
	}else if(this._srcLoading.indexOf(identifier) > -1){
		//Globals.log("Cancel but already loading");
	}
	//remove callback, if alreadying loading then it needs to check for the pressence of identifier in hask table.
	this._srcToCallBackHashTable[identifier] = undefined;
	delete this._srcToCallBackHashTable[identifier];
}

ImageLoadManager.prototype.requestImageIdentifier = function(){
	this._loadIncrement += 1;
	return "_"+this._loadIncrement;
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