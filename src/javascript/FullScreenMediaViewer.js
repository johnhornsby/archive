var FullScreenMediaViewer = function(){
	EventDispatcher.call(this);
	
	this._containerElement;
	this._mediaViewer;
	this._data;
	this._dataItem;
	this._dataItemIndex;
	this._isOpen = false;
	this._maxItems = 0;
	this._delegate;
	this._status = FullScreenMediaViewer.INITIALISED;
	this._indexHistory = [];
	this._prospectiveIndex;
	this._veilLoader;
	this.init();
};
FullScreenMediaViewer.prototype = new EventDispatcher();

FullScreenMediaViewer.INITIALISED = 0
FullScreenMediaViewer.ANIMATING_OUT = 1;
FullScreenMediaViewer.ANIMATING_IN = 2;
FullScreenMediaViewer.LOADING = 3;
FullScreenMediaViewer.IN = 4;





//PRIVATE
//_________________________________________________________________________________
FullScreenMediaViewer.prototype.init = function(){
	this._containerElement = $("#full-screen-media-viewer").get(0);
	$("#full-screen-media-viewer > .closeButton").bind("click",this.onCloseButtonClickHandler.context(this));
	$("#full-screen-media-viewer > .previousButton").bind("click",this.onPreviousButtonClickHandler.context(this));
	$("#full-screen-media-viewer > .nextButton").bind("click",this.onNextButtonClickHandler.context(this));
	this._veilLoader = new VeilLoader($("#full-screen-media-viewer-item").get(0),"#000",1);
};

FullScreenMediaViewer.prototype.setDataItem = function(dataItem){
	this._dataItem = dataItem;
	this.clearItem();	//clears dataItem as well as _mediaViewer
}

FullScreenMediaViewer.prototype.clearItem = function(){
	//this._dataItem = undefined;
	if(this._mediaViewer != undefined){
		if(this._mediaViewer.constructor === VimeoView){
			//this._mediaViewer.pause();
			//this._mediaViewer.unsafeDestroy();
			this._mediaViewer.removeEventListener(VimeoViewEvent.VIMEO_READY, this.onMediaViewerCompleteReady.rEvtContext(this));
			var self = this;
			this._mediaViewer.destroyWithCallback(function(){
				self._mediaViewer = undefined;
				self.onClearItemComplete();
			});
		}else{
			this._mediaViewer.removeEventListener(ImageViewEvent.IMAGE_LOADED, this.onMediaViewerCompleteReady.rEvtContext(this));
			this._mediaViewer.destroy();
			this._mediaViewer = undefined;
			this.onClearItemComplete();
		}
	}else{
		this.onClearItemComplete();
	}
};

FullScreenMediaViewer.prototype.onClearItemComplete = function(){
	if(this._dataItem !== undefined){
		this.displayItem();
	}
};

FullScreenMediaViewer.prototype.displayItem = function(){
	if(this._dataItem.m === ArtefactDataManager.FILTER_PHOTO || this._dataItem.m === ArtefactDataManager.FILTER_POSTER){ //imageView
		var mediaViewerContainer = $("#full-screen-media-viewer-item").get(0);
		this._mediaViewer = new ImageView(this._dataItem,mediaViewerContainer);
		this._mediaViewer.addEventListener(ImageViewEvent.IMAGE_LOADED, this.onMediaViewerCompleteReady.context(this));
	}else{	//vimeo
		var mediaViewerContainer = $("#full-screen-media-viewer-item").get(0);
		this._mediaViewer = new VimeoView(this._dataItem,mediaViewerContainer);
		this._mediaViewer.addEventListener(VimeoViewEvent.VIMEO_READY, this.onMediaViewerCompleteReady.rEvtContext(this));
	}
};

FullScreenMediaViewer.prototype.onMediaViewerCompleteReady = function(){
	
};




FullScreenMediaViewer.prototype.onCloseButtonClickHandler = function(e){
	this.close();
};

FullScreenMediaViewer.prototype.onPreviousButtonClickHandler = function(e){
	this.previous();
};

FullScreenMediaViewer.prototype.onNextButtonClickHandler = function(e){
	this.next();
};


FullScreenMediaViewer.prototype.close = function(){
	$("#full-screen-media-viewer").css("display","none");
	this._dataItem = undefined;
	this.clearItem();
	this._isOpen = false;
};

FullScreenMediaViewer.prototype.onOpen = function(){
	$("#full-screen-media-viewer").css("display","block");
	this._isOpen = true;
	//this.setData(data);
	this._dataItemIndex = 0;
	this.reload();
};

FullScreenMediaViewer.prototype.setDataItemIndex = function(index){
	this._dataItemIndex = index;
	var dataItem = this._delegate.getDataForIndex(this._dataItemIndex);
	if(dataItem !== this._dataItem){
		this.setDataItem(dataItem);
	}
}

FullScreenMediaViewer.prototype.showNavigation = function(b){
	if(b){
		$("#full-screen-media-viewer > .previousButton").css("left",0);
		$("#full-screen-media-viewer > .nextButton").css("right",0);
	}else{
		$("#full-screen-media-viewer > .previousButton").css("left",-44);
		$("#full-screen-media-viewer > .nextButton").css("right",-44);
	}
}



//PUBLIC
//_________________________________________________________________________________
FullScreenMediaViewer.prototype.open = function(){
	this.onOpen();
};

FullScreenMediaViewer.prototype.isOpen = function(){
	return this._isOpen;
};

FullScreenMediaViewer.prototype.next = function(){
	var dataItemIndex = this._dataItemIndex + 1;
	if(dataItemIndex >= this._maxItems){
		dataItemIndex = 0;
	}
	this.setDataItemIndex(dataItemIndex);
};

FullScreenMediaViewer.prototype.previous = function(){
	var dataItemIndex = this._dataItemIndex - 1;
	if(dataItemIndex <= -1){
		dataItemIndex = this._maxItems -1;
	}
	this.setDataItemIndex(dataItemIndex);
};

FullScreenMediaViewer.prototype.setDelegate = function(delegate){
	this._delegate = delegate;
};

FullScreenMediaViewer.prototype.reload = function(){
	this._maxItems = this._delegate.getNumberOfItems();
	if(this._dataItemIndex >= this._maxItems){
		this._dataItemIndex = 0;
	}
	this.showNavigation(this._maxItems > 1);
	this.setDataItemIndex(this._dataItemIndex);
};

FullScreenMediaViewer.prototype.setSelectedIndex = function(index){
	if(index > -1 && index < this._maxItems){
		this.setDataItemIndex(index);
	}else{
		throw {message:"Index "+index+" out of range 0 - "+(this._maxItems-1)}
	}
};
