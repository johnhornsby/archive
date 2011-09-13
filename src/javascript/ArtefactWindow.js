var ArtefactWindow = function(){
	EventDispatcher.call(this);
	
	this._containerElement;
	this._mediaViewer;
	this._data;
	
	
	this._relatedArtefactViewController;
	this._isOpen = false;
	
	this.init();
};
ArtefactWindow.prototype = new EventDispatcher();






//PRIVATE
//_________________________________________________________________________________
ArtefactWindow.prototype.init = function(){
	this._containerElement = $("#artefactWindow").get(0);
	$("#artefactWindow .closeButton").bind("click",this.onCloseButtonClickHandler.context(this));
	$("#artefactWindow .fullscreenButton").bind("click",this.onFullscreenButtonClickHandler.context(this));
	$("#artefactWindow .addToFavouritesButton").bind("click",this.onAddToFavouritesButtonClickHandler.context(this));
	$("#artefactWindow .removeFromFavouritesButton").bind("click",this.onRemoveFromFavouritesButtonClickHandler.context(this));
	
	$("#artefactWindow .vimeoPlayButton").bind("click",this.onPlayButtonClickHandler.context(this)).hide();
	$("#artefactWindow .vimeoPauseButton").bind("click",this.onPauseButtonClickHandler.context(this)).hide();
	$("#artefactWindow .vimeoUnloadButton").bind("click",this.onUnloadButtonClickHandler.context(this)).hide();
	
	//#artefactWindow.vimeoPlayButton, #artefactWindow.vimeoPauseButton, #artefactWindow.vimeoUnloadButton {
	//display:none;	

	
	this._relatedArtefactViewController = new RelatedArtefactsViewController();
};

ArtefactWindow.prototype.onPlayButtonClickHandler = function(e){
	this._mediaViewer.play();
};
ArtefactWindow.prototype.onPauseButtonClickHandler = function(e){
	this._mediaViewer.pause();
};
ArtefactWindow.prototype.onUnloadButtonClickHandler = function(e){
	this._mediaViewer.unload();
};
ArtefactWindow.prototype.onCloseButtonClickHandler = function(e){
	this.close();
};

ArtefactWindow.prototype.onAddToFavouritesButtonClickHandler = function(e){
	Globals.localStorageManager.setArtefactFavourite(this._data, true);
	this.updateFavouritesButtons();
	this.dispatchEvent(new ArtefactWindowEvent(ArtefactWindowEvent.ARTEFACT_ADD_TO_FAVOURITES,this._data,this._bounds));
};

ArtefactWindow.prototype.onRemoveFromFavouritesButtonClickHandler = function(e){
	Globals.localStorageManager.setArtefactFavourite(this._data, false);
	this.updateFavouritesButtons();
	this.dispatchEvent(new ArtefactWindowEvent(ArtefactWindowEvent.ARTEFACT_REMOVE_FROM_FAVOURITES,this._data,this._bounds));
};

ArtefactWindow.prototype.onFullscreenButtonClickHandler = function(e){
	this.dispatchEvent(new ArtefactWindowEvent(ArtefactWindowEvent.OPEN_FULL_SCREEN_WINDOW,this._data));
};

ArtefactWindow.prototype.updateFavouritesButtons = function(){
	var addToFavouritesDisplay = (this._data.f===0)?"block":"none";
	var removeFromFavouritesDisplay = (this._data.f===0)?"none":"block";
	$("#artefactWindow .addToFavouritesButton").css("display",addToFavouritesDisplay);
	$("#artefactWindow .removeFromFavouritesButton").css("display",removeFromFavouritesDisplay)
};



ArtefactWindow.prototype.onOpen = function(data,bounds){
	
	if(this._isOpen === true){
		this.onClose();
	}
	this._isOpen = true;
	
	this._data = data;
	
	$("#veil").css("display","block");
	$("#veil").css("opacity","1");
	
	$("#artefactWindow").css("display","block");
	if(data.m === ArtefactDataManager.FILTER_PHOTO || data.m === ArtefactDataManager.FILTER_POSTERS){ //imageView
		var mediaViewerContainer = $("#artefactWindowMediaView").get(0);
		this._mediaViewer = new ImageView(data,mediaViewerContainer,0,"_448x336");
		$("#artefactWindow .fullscreenButton").css("display","block");
		//$("#artefactWindowMediaView").bind("click",this.onFullscreenButtonClickHandler.context(this));
	}else{	//vimeo
		var mediaViewerContainer = $("#artefactWindowMediaView").get(0);
		this._mediaViewer = new VimeoView(data,mediaViewerContainer);
		$("#artefactWindow .fullscreenButton").css("display","none");
	}
	
	var html = "";
	html += '<h2>'+this._data.t+'</h2>';
	html += '<p><strong>Production:</strong> '+this._data.p+'</p>';
	html += '<p><strong>Date:</strong> '+this._data.d+'</p>';
	html += '<p><strong>Creative Direction:</strong> '+this._data.c+'</p>';
	html += '<p><strong>Featured Individuals:</strong> '+this._data.a+'</p>';
	
	$("#artefactDetails").html(html);
	
	this.updateFavouritesButtons();
	
	this._relatedArtefactViewController.setData(this._data);
	
	Globals.deepLinkingManager.setAddress("/item-"+data.id);
};

ArtefactWindow.prototype.onClose = function(){
	$("#artefactWindow").css("display","none");
	this._mediaViewer.destroy();
	this._mediaViewer = undefined;
	$("#artefactWindowMediaView").unbind("click",this.onFullscreenButtonClickHandler.context(this));
	
	this._relatedArtefactViewController.clear();
	this._isOpen = false;
	$("#veil").css("opacity","0");
	$("#veil").css("display","none");
};





//PUBLIC
//_________________________________________________________________________________

ArtefactWindow.prototype.open = function(data,bounds){
	this.onOpen(data,bounds);
};

ArtefactWindow.prototype.close = function(){
	if(this._isOpen === true){
		this.onClose();
		Globals.deepLinkingManager.setAddress("/");
	}
};




//Event Classes
//_________________________________________________________________________________________	
var ArtefactWindowEvent = function(eventType,data){
	this.eventType = eventType;
	this.data = data;
};
ArtefactWindowEvent.OPEN_FULL_SCREEN_WINDOW = "openFullScreenWindow";
ArtefactWindowEvent.ARTEFACT_ADD_TO_FAVOURITES = "artefactAddToFavourites";
ArtefactWindowEvent.ARTEFACT_REMOVE_FROM_FAVOURITES = "artefactRemoveFromFavourites";
ArtefactWindowEvent.CLOSE = "close";