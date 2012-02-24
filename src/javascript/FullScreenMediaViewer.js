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
	this.init();
};
FullScreenMediaViewer.prototype = new EventDispatcher();





//PRIVATE
//_________________________________________________________________________________

FullScreenMediaViewer.prototype.clear = function(){
	if(this._mediaViewer != undefined){
		
		if(this._mediaViewer.constructor === VimeoView){
			this._mediaViewer.pause();
			this._mediaViewer.unsafeDestroy();
		}else{
			this._mediaViewer.destroy();
		}
		
		this._mediaViewer = undefined;
	}
	this._dataItem = undefined;
};

FullScreenMediaViewer.prototype.init = function(){
	this._containerElement = $("#full-screen-media-viewer").get(0);
	$("#full-screen-media-viewer > .closeButton").bind("click",this.onCloseButtonClickHandler.context(this));
	$("#full-screen-media-viewer > .previousButton").bind("click",this.onPreviousButtonClickHandler.context(this));
	$("#full-screen-media-viewer > .nextButton").bind("click",this.onNextButtonClickHandler.context(this));
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

FullScreenMediaViewer.prototype.setDataItem = function(dataItem){
	this.clear();	//clears dataItem as well as _mediaViewer
	this._dataItem = dataItem;
	if(this._dataItem.m === ArtefactDataManager.FILTER_PHOTO || this._dataItem.m === ArtefactDataManager.FILTER_POSTER){ //imageView
		var mediaViewerContainer = $("#full-screen-media-viewer-item").get(0);
		this._mediaViewer = new ImageView(this._dataItem,mediaViewerContainer);
	}else{	//vimeo
	var mediaViewerContainer = $("#full-screen-media-viewer-item").get(0);
		this._mediaViewer = new VimeoView(this._dataItem,mediaViewerContainer);
	}
}

FullScreenMediaViewer.prototype.close = function(){
	$("#full-screen-media-viewer").css("display","none");
	this.clear();
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
