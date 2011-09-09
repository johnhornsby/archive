var FullScreenWindow = function(){
	EventDispatcher.call(this);
	
	this._containerElement;
	this._mediaViewer;
	
	this.init();
};
FullScreenWindow.prototype = new EventDispatcher();





//PRIVATE
//_________________________________________________________________________________
FullScreenWindow.prototype.init = function(){
	this._containerElement = $("#imageFullScreenView").get(0);
	$("#imageFullScreenView > .closeButton").bind("click",this.onCloseButtonClickHandler.context(this));
	//$(this._containerElement).bind("click",this.onCloseButtonClickHandler.context(this));
	
};

FullScreenWindow.prototype.onCloseButtonClickHandler = function(e){
	this.close();
};

FullScreenWindow.prototype.close = function(){
	$("#imageFullScreenView").css("display","none");
	this._mediaViewer.destroy();
	this._mediaViewer = undefined;
};

FullScreenWindow.prototype.onOpen = function(data){
	$("#imageFullScreenView").css("display","block");
	if(data.m === ArtefactDataManager.FILTER_PHOTO || data.m === ArtefactDataManager.FILTER_POSTER){ //imageView
		var mediaViewerContainer = $("#imageFullScreenMediaView").get(0);
		this._mediaViewer = new ImageView(data,mediaViewerContainer);
	}else{	//vimeo
	var mediaViewerContainer = $("#imageFullScreenMediaView").get(0);
		this._mediaViewer = new ImageView(data,mediaViewerContainer);
	}
};





//PUBLIC
//_________________________________________________________________________________
FullScreenWindow.prototype.open = function(data){
	this.onOpen(data);
};