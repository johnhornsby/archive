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
	$("#artefactWindow .facebookShareButton").bind("click",this.onFacebookShareButtonClickHandler.context(this));
	$("#artefactWindow .twitterShareButton").bind("click",this.onTwitterShareButtonClickHandler.context(this));
	
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

ArtefactWindow.prototype.onFacebookShareButtonClickHandler = function(e){
	var hyperlink = encodeURIComponent(window.location.href);
	
	var production = this._data.p;
	var text = "Check out this archive item from the Donmar production "+production;
	text = encodeURIComponent(text);
	window.location.href = "http://www.facebook.com/sharer.php?u="+hyperlink+"&t="+text;
};

ArtefactWindow.prototype.onTwitterShareButtonClickHandler = function(e){
	var title = this._data.t;
	var production = this._data.p
	/*
	We should have 114 characters to play with in the message, the remainer will be used for the url which is automatically shortened with twitters t.co service.
	Initally had problems testing this as the twitter client was not able to shorten http://localhost/ 
	*/
	
	var text = "Check out this archive item from the Donmar production "+production;
	if(text.length >119){
		text = text.substring(0,116) + "...";
	}
	text = encodeURIComponent(text);
	var hyperlink = encodeURIComponent(window.location.href);
	window.location.href = "http://twitter.com/share?text="+text+"&related=donmarwarehouse&url="+hyperlink;
	
	//var login = "johnhornsby";
	//var api_key = "R_d7376c932c691a1a530ed879fc951773";
	//http://api.bitly.com/v3/shorten?login=johnhornsby&apiKey=R_d7376c932c691a1a530ed879fc951773&longUrl=http%3A%2F%2Finteractivelabs.co.uk%2F&format=json
	/*
	$.getJSON(
        "http://api.bitly.com/v3/shorten?login=johnhornsby&apiKey=R_d7376c932c691a1a530ed879fc951773&longUrl=http%3A%2F%2Finteractivelabs.co.uk%2F&format=json",
        function(response)
        {
			var str = "I wanted to share this great link "+ response.data.url;
			str = encodeURIComponent(str);
			
           
        }
    );
	*/
	
};




ArtefactWindow.prototype.onOpen = function(data,bounds){
	
	if(this._isOpen === true){
		this.onClose();
	}
	this._isOpen = true;
	
	this._data = data;
	
	//$("#veil").css("display","block");
	//$("#veil").css("opacity","1");
	$("#veil").show();
	
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
	//$("#veil").css("opacity","0");
	//$("#veil").css("display","none");
	$("#veil").hide();
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