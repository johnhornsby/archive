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
	this._veilLoader.addEventListener(VeilLoaderEvent.OPENED,this.onVeilLoaderOpened.context(this));
	this._veilLoader.addEventListener(VeilLoaderEvent.CLOSED,this.onVeilLoaderClosed.context(this));
};

FullScreenMediaViewer.prototype.clearItem = function(){
	if(this._mediaViewer != undefined){
		if(this._mediaViewer.constructor === VimeoView){
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
	this._status = FullScreenMediaViewer.LOADING;
	if(this._dataItem.m === ArtefactDataManager.FILTER_PHOTO || this._dataItem.m === ArtefactDataManager.FILTER_POSTER){
		var mediaViewerContainer = $("#full-screen-media-viewer-item").get(0);
		this._mediaViewer = new ImageView(this._dataItem,mediaViewerContainer);
		this._mediaViewer.addEventListener(ImageViewEvent.IMAGE_LOADED, this.onMediaViewerCompleteReady.context(this));
		this._mediaViewer.load();
	}else{
		var mediaViewerContainer = $("#full-screen-media-viewer-item").get(0);
		this._mediaViewer = new VimeoView(this._dataItem,mediaViewerContainer);
		this._mediaViewer.addEventListener(VimeoViewEvent.VIMEO_READY, this.onMediaViewerCompleteReady.rEvtContext(this));
		this._mediaViewer.addEventListener(VimeoViewEvent.VIMEO_DESTROYED, this.onMediaViewerDestroyedComplete.rEvtContext(this));
		this._mediaViewer.load();
	}
};

FullScreenMediaViewer.prototype.onMediaViewerCompleteReady = function(){
	if(this._veilLoader.isOpen()){
		this._status = FullScreenMediaViewer.ANIMATING_IN;
		this._veilLoader.close({time:0.5});
	}else{
		this._status = FullScreenMediaViewer.IN;
		this.checkProspectiveIndex();
	}
};

FullScreenMediaViewer.prototype.onMediaViewerDestroyedComplete = function(){
	
};

FullScreenMediaViewer.prototype.onVeilLoaderOpened = function(){
	if(this._dataItem.m === ArtefactDataManager.FILTER_PHOTO || this._dataItem.m === ArtefactDataManager.FILTER_POSTER){
		this.clearItem();
	}else{
		this.clearItem();
	}
};

FullScreenMediaViewer.prototype.onVeilLoaderClosed = function(){
	this._status = FullScreenMediaViewer.IN;
	this.checkProspectiveIndex();
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
	this._dataItemIndex = 0;
	this.reload();
};

FullScreenMediaViewer.prototype.setDataItemIndex = function(index){
	this.saveProspectiveIndex(index);
	if(this._status !== FullScreenMediaViewer.IN && this._status !== FullScreenMediaViewer.INITIALISED){	//we need to check if UI is animating in, loading or out
		return false;
	}
	
	this._dataItemIndex = index;
	var dataItem = this._delegate.getDataForIndex(this._dataItemIndex);
	if(dataItem !== this._dataItem){
		this._status = FullScreenMediaViewer.ANIMATING_OUT;
		if(this._dataItem === undefined){
			this._dataItem = dataItem;
			this.clearItem();
		}else{
			this._dataItem = dataItem;
			this._veilLoader.open({time:0.5});
		}
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

FullScreenMediaViewer.prototype.saveProspectiveIndex = function(index){
	this._prospectiveIndex = index;
};

FullScreenMediaViewer.prototype.checkProspectiveIndex = function(){
	if(this._prospectiveIndex !== this._dataItemIndex){
		this.setSelectedIndex(this._prospectiveIndex);
	}
};

//PUBLIC
//_________________________________________________________________________________
FullScreenMediaViewer.prototype.setDelegate = function(delegate){
	this._delegate = delegate;
};

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
