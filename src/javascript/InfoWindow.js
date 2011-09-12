var InfoWindow = function(){
	EventDispatcher.call(this);
	
	this._containerElement;
	this._isOpen = false;
	
	this._touchPanelViewController;
	this._videoTutorialElement;
	this._isVideoLoaded = false;
	
	this.init();
};
InfoWindow.prototype = new EventDispatcher();






//PRIVATE
//_________________________________________________________________________________
InfoWindow.prototype.init = function(){
	this._containerElement = $("#infoWindow").get(0);
	$("#infoWindow .closeButton").bind("click",this.onCloseButtonClickHandler.context(this));
	$("#infoWindowViewOnStartUp").bind("change",this.onCheckBoxChange.evtContext(this));
	this._videoTutorialElement = document.getElementById('infoWindowGraphicVideo');
	//$(this._videoTutorialElement).bind("canplaythrough",this.onCanPlayThrough.context(this));
	//$(this._videoTutorialElement).bind("canplaythrough",this.onCanPlayThrough.context(this));
	
	//this._videoTutorialElement.oncanplay = function(){alert("hello");};
	
	this._touchPanelViewController = new TouchScrollPanel({scrollDirection:TouchScrollPanel.SCROLL_DIRECTION_VERTICAL, frameElement:$('#infoWindow .infoWindowText')[0], contentElement:$('#infoWindow .generalText')[0]});
};

InfoWindow.prototype.onCanPlayThrough = function(){
	console.log('onCanPlayThrough');
	this._isVideoLoaded = true;
	if(this._isOpen === true){
		this._videoTutorialElement.play();
	}
};

InfoWindow.prototype.onCloseButtonClickHandler = function(e){
	this.close();
};

InfoWindow.prototype.onOpen = function(data,bounds){
	
	if(this._isOpen === true){
		this.close();
	}
	this._isOpen = true;
	
	$("#veil").css("display","block");
	$("#veil").css("opacity","1");
	
	$("#infoWindow").css("display","block");
	
	if(Globals.localStorageManager.isShowInfoOnEnter() === true){
		$("#infoWindowViewOnStartUp").get(0).checked = true;
		$("#infoWindowViewOnStartupContainer h5").html("Uncheck to hide this information upon entering the Archive");
	}else{
		$("#infoWindowViewOnStartUp").get(0).checked = false;
		$("#infoWindowViewOnStartupContainer h5").html("Check to show this information upon entering the Archive");
	}
	//set scroll to 0 so it scroll back up to top
	this._touchPanelViewController.setScrollY(this._touchPanelViewController.getScrollMinY());
	this._touchPanelViewController.updateThumb();
	
	if(this._isVideoLoaded === true){
		this._videoTutorialElement.play();
	}
};

InfoWindow.prototype.close = function(){
	$("#infoWindow").css("display","none");
	this._isOpen = false;
	$("#veil").css("opacity","0");
	$("#veil").css("display","none");
	//this._videoTutorialElement.stop();
};

InfoWindow.prototype.onCheckBoxChange = function(e,checkBox){
	//Globals.localStorageManager.setShowInforOnEnter($(checkBox).checked);
	if($("#infoWindowViewOnStartUp").get(0).checked === true){
		Globals.localStorageManager.setShowInforOnEnter(true);
		$("#infoWindowViewOnStartupContainer h5").html("Uncheck to hide this information upon entering the Archive");
	}else{
		Globals.localStorageManager.setShowInforOnEnter(false);
		$("#infoWindowViewOnStartupContainer h5").html("Check to show this information upon entering the Archive");
	}
};



//PUBLIC
//_________________________________________________________________________________

InfoWindow.prototype.open = function(data,bounds){
	this.onOpen(data,bounds);
};





//Event Classes
//_________________________________________________________________________________________	
var InfoWindowEvent = function(eventType){
	this.eventType = eventType;
};
InfoWindowEvent.CLOSE = "close";