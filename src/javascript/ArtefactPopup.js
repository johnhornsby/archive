var ArtefactPopup = function(){
	EventDispatcher.call(this);
	
	
	this._data;
	this._bounds;
	this._containerElement;
	
	//this._mediaViewer;
	
	this.init();
};
ArtefactPopup.prototype = new EventDispatcher();






//PRIVATE
//_________________________________________________________________________________
ArtefactPopup.prototype.init = function(){
	this._containerElement = $("#artefactPopup").get(0);
	$("#artefactPopup .closeButton").bind("click",this.onCloseButtonClickHandler.context(this));
	//$("#artefactPopup > .closeButton").bind("mousedown",this.onCloseButtonMouseDownHandler.context(this));
	$("#artefactPopup .openArtefactButton").bind("click",this.onOpenArtefactButtonClickHandler.context(this));
	$("#artefactPopup .addToFavouritesButton").bind("click",this.onAddToFavouritesButtonClickHandler.context(this));
	$("#artefactPopup .removeFromFavouritesButton").bind("click",this.onRemoveFromFavouritesButtonClickHandler.context(this));
};

ArtefactPopup.prototype.onCloseButtonClickHandler = function(e){
	this.close();
};

ArtefactPopup.prototype.onOpenArtefactButtonClickHandler = function(e){
	this.close();
	this.dispatchEvent(new ArtefactPopupEvent(ArtefactPopupEvent.OPEN_ARTEFACT,this._data,this._bounds));
};

ArtefactPopup.prototype.onAddToFavouritesButtonClickHandler = function(e){
	Globals.localStorageManager.setArtefactFavourite(this._data, true);
	this.updateFavouritesButtons();
	this.close();
	this.dispatchEvent(new ArtefactPopupEvent(ArtefactPopupEvent.ARTEFACT_ADD_TO_FAVOURITES,this._data,this._bounds));
};

ArtefactPopup.prototype.onRemoveFromFavouritesButtonClickHandler = function(e){
	Globals.localStorageManager.setArtefactFavourite(this._data, false);
	this.updateFavouritesButtons();
	this.close();
	this.dispatchEvent(new ArtefactPopupEvent(ArtefactPopupEvent.ARTEFACT_REMOVE_FROM_FAVOURITES,this._data,this._bounds));
};


ArtefactPopup.prototype.onOpen = function(data,bounds){
	this._data = data;
	this._bounds = bounds;
	$("#artefactPopup").css("display","block");
	//$("#artefactPopup").css("left",bounds.left+"px");
	//$("#artefactPopup").css("top",bounds.top+"px");
	$("#artefactPopupTitle").html(this._data.t);
	
	this.updateFavouritesButtons();
};

ArtefactPopup.prototype.onClose = function(){
	$("#artefactPopup").css("display","none");
	this.dispatchEvent(new ArtefactPopupEvent(ArtefactPopupEvent.CLOSE,this._data,this._bounds));
};

ArtefactPopup.prototype.updateFavouritesButtons = function(){
	var addToFavouritesDisplay = (this._data.f===0)?"block":"none";
	var removeFromFavouritesDisplay = (this._data.f===0)?"none":"block";
	$("#artefactPopup .addToFavouritesButton").css("display",addToFavouritesDisplay);
	$("#artefactPopup .removeFromFavouritesButton").css("display",removeFromFavouritesDisplay)
};




//PUBLIC
//_________________________________________________________________________________
ArtefactPopup.prototype.open = function(data,bounds){
	this.onOpen(data,bounds);
};

ArtefactPopup.prototype.close = function(){
	this.onClose();
};

ArtefactPopup.prototype.getHeight = function(){
	return fullHeight(this._containerElement);
}

ArtefactPopup.prototype.getElement = function(){
	return this._containerElement;
}

ArtefactPopup.prototype.setPosition = function(x,y){
	$("#artefactPopup").css("left",x+"px");
	$("#artefactPopup").css("top",y+"px");
}


//Event Classes
//_________________________________________________________________________________________	
var ArtefactPopupEvent = function(eventType,data,bounds){
	this.eventType = eventType;
	this.data = data;
	this.bounds = bounds;
};
ArtefactPopupEvent.OPEN_ARTEFACT = "openArtefact";
ArtefactPopupEvent.ARTEFACT_ADD_TO_FAVOURITES = "artefactAddToFavourites";
ArtefactPopupEvent.ARTEFACT_REMOVE_FROM_FAVOURITES = "artefactRemoveFromFavourites";
ArtefactPopupEvent.CLOSE = "close";