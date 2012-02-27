var ViewController = function(){
	EventDispatcher.call(this);
	
	//properties - visual
	this._artefactPopup;
	this._artefactWindow;
	this._busyFeebbackView;
	this._dockViewController;
	this._fullscreenWindow;
	this._fullScreenMediaViewer;
	this._infoWindow;
	this._progressFeedbackView;
	this._siteNavigationView;
	this._tapestryViewController;
	this._animationLayer;
	this._veil;
	
	this._isPopupOpen = false;
	this._popupBlockerTimer;
	this._isPopupBlocked = false;
	
};
ViewController.prototype = new EventDispatcher();





//PRIVATE
//_________________________________________________________________________________
ViewController.prototype.onInit = function(){
	this.build();
	Globals.deepLinkingManager.addEventListener(DeepLinkingManagerEvent.UPDATE_ADDRESS,this.onUpdateDeepLinkAddress.context(this));	//listen to deepLinkingManager to determin whether ArtefactWindow should open or close
	Globals.deepLinkingManager.checkAddress();																						//check address on init, if an initial hash has been set then it will be picked up here, and the event will be fired as above
	$(window).bind("resize",this.onResize.context(this));
	this.updateGlobalWindowSize();
};

ViewController.prototype.build = function(){
	
	
	this._tapestryViewController = new TapestryViewController();
	this._tapestryViewController.addEventListener(TapestryViewControllerEvent.BUSY_START,this.onTapestryBusyStartHandler.context(this));
	this._tapestryViewController.addEventListener(TapestryViewControllerEvent.BUSY_COMPLETE,this.onTapestryBusyCompleteHandler.context(this));
	this._tapestryViewController.addEventListener(TapestryViewControllerEvent.NO_RESULTS,this.onTapestryNoResultsHandler.context(this));
	this._tapestryViewController.addEventListener(TapestryInteractionViewControllerEvent.SINGLE_CLICK,this.onOpenArtefactPopUpHandler.context(this));
	this._tapestryViewController.addEventListener(TapestryInteractionViewControllerEvent.DOUBLE_CLICK,this.onOpenArefactWindowHandler.context(this));
	this._tapestryViewController.addEventListener(TapestryInteractionViewControllerEvent.MOUSE_DOWN,this.onPopUpCleanUpHandler.context(this));
	
	this._dockViewController = new DockViewController(this);
	this._dockViewController.addEventListener(DockViewControllerEvent.CHANGE_SELECTION,this.onDockChangeSelectionHandler.context(this));
	this._dockViewController.addEventListener(DockViewControllerEvent.INFO_OPEN,this.onDockInfoOpenHandler.context(this));
	//this._dockViewController.activate();	//this is activated once initial search has completed
	
	this._artefactPopup = new ArtefactPopup();
	this._artefactPopup.addEventListener(ArtefactPopupEvent.OPEN_ARTEFACT,this.onOpenArefactWindowHandler.context(this));
	this._artefactPopup.addEventListener(ArtefactPopupEvent.ARTEFACT_ADD_TO_FAVOURITES,this.onAddToFavouritesWithinPopUpHandler.context(this));
	this._artefactPopup.addEventListener(ArtefactPopupEvent.ARTEFACT_REMOVE_FROM_FAVOURITES,this.onRemoveFromFavouritesWithinPopUpHandler.context(this));
	this._artefactPopup.addEventListener(ArtefactPopupEvent.CLOSE,this.onPopUpCloseHandler.context(this));
	
	this._artefactWindow = new ArtefactWindow();
	this._artefactWindow.addEventListener(ArtefactWindowEvent.OPEN_FULL_SCREEN_WINDOW,this.onOpenFullScreenWindowHandler.context(this));
	this._artefactWindow.addEventListener(ArtefactWindowEvent.RELOAD_FULL_SCREEN_WINDOW,this.onReloadFullScreenWindowHandler.context(this));
	this._artefactWindow.addEventListener(ArtefactWindowEvent.ARTEFACT_REMOVE_FROM_FAVOURITES,this.onRemoveFromFavouritesWithinWindowHandler.context(this));
	this._artefactWindow.addEventListener(ArtefactWindowEvent.ARTEFACT_ADD_TO_FAVOURITES,this.onAddToFavouritesWithinWindowHandler.context(this));
	
	this._infoWindow = new InfoWindow();
	this._infoWindow.addEventListener(InfoWindowEvent.CLOSE,this.onInfoWindowCloseHandler.context(this));							//Event handler used to determing upon close if ViewController needs to open an ArtefactWidow due to deep link.
	
	this._fullscreenWindow = new FullScreenWindow();
	this._fullScreenMediaViewer = new FullScreenMediaViewer();
	this._fullScreenMediaViewer.setDelegate(this._artefactWindow);
	
	this._animationLayer = new AnimationLayer(document.getElementById('animationLayer'));
	this._veil = new Veil(document.getElementById('veil'));
	
	if(Globals.localStorageManager.isShowInfoOnEnter() === true){
		var self = this;
		function openInfoWindow(){
			self._infoWindow.open();
		}
		setTimeout(openInfoWindow,1000);
	}
};



ViewController.prototype.onTapestryBusyStartHandler = function(e){
	this.dispatchEvent(new ViewControllerEvent(ViewControllerEvent.BUSY_START));
};

ViewController.prototype.onTapestryBusyCompleteHandler = function(e){
	this.dispatchEvent(new ViewControllerEvent(ViewControllerEvent.BUSY_COMPLETE));
};

ViewController.prototype.onTapestryNoResultsHandler = function(e){
	this._dockViewController.setSelectionObject(Globals.artefactDataManager.getSelectionObject());
};




ViewController.prototype.onDockChangeSelectionHandler = function(e){
	this._tapestryViewController.setSelectionObject(e.selectionObject);
};

ViewController.prototype.onDockInfoOpenHandler = function(e){
	this._infoWindow.open();
};




ViewController.prototype.onRemoveFromFavouritesWithinPopUpHandler = function(artefactPopupEvent){
	if(Globals.artefactDataManager.getSelectionObject().isFavourite === true){			//if artefacts filter is on then update view
		this._tapestryViewController.setSelectionObject(Globals.artefactDataManager.getSelectionObject());
	}else{
		this._animationLayer.removeFromMyArchiveInGridAnimation(artefactPopupEvent.data,artefactPopupEvent.bounds);
	}
};

ViewController.prototype.onAddToFavouritesWithinPopUpHandler = function(artefactPopupEvent){
	var myArchiveButtonBounds = this._dockViewController.getMyArchiveButtonBounds();
	this._animationLayer.addToArchiveFromGridAnimation(artefactPopupEvent.data,artefactPopupEvent.bounds,myArchiveButtonBounds);
};

ViewController.prototype.onRemoveFromFavouritesWithinWindowHandler = function(artefactWindowEvent){
	if(Globals.artefactDataManager.getSelectionObject().isFavourite === true){			//if artefacts filter is on then update view
		this._tapestryViewController.setSelectionObject(Globals.artefactDataManager.getSelectionObject());
	}else{
		//this._animationLayer.removeFromMyArchiveInGridAnimation(artefactWindowEvent.data,artefactWindowEvent.bounds);
	}
};
ViewController.prototype.onAddToFavouritesWithinWindowHandler = function(artefactWindowEvent){};



ViewController.prototype.onOpenArtefactPopUpHandler = function(e){
	if(this._isPopupOpen === false){
		if(this._isPopupBlocked === false ){
			
			this._artefactPopup.open(e.data,e.bounds);
			
			var gutter = 10;
			var popupWidth = 300+50;
			var popupLeft = Math.round(e.bounds.left + (e.bounds.width/2)) - (popupWidth/2);
			var popupHeight = this._artefactPopup.getHeight()
			var popupTop = (e.bounds.top - (popupHeight + gutter));
			
			if(popupLeft + popupWidth > window.innerWidth){//centering placeds right off screen
				popupLeft = window.innerWidth - popupWidth;
			}else if(popupLeft < 0){
				popupLeft = 0;
			}
			
			if(popupTop < 0){
				popupTop = e.bounds.top + e.bounds.height + gutter;
			}
			
			
			this._artefactPopup.setPosition(popupLeft,popupTop);
			
			this._isPopupOpen = true;
		}
	}
	
};

ViewController.prototype.onOpenArefactWindowHandler = function(e){
	this._artefactWindow.open(e.data);
};

ViewController.prototype.onOpenFullScreenWindowHandler = function(e){
	//this._fullscreenWindow.open(e.data);
	this._fullScreenMediaViewer.open();
};

ViewController.prototype.onReloadFullScreenWindowHandler = function(e){
	this._fullScreenMediaViewer.reload();
};

ViewController.prototype.onWindowClose = function(){
	
};
ViewController.prototype.clearPopupBlocker = function(){
	this._isPopupBlocked = false;
};

ViewController.prototype.onPopUpCloseHandler = function(){
	this._isPopupOpen = false;
	this._isPopupBlocked = false;
};

/**
* Event Handler for DeepLinkingManager when address is updated externally
* @private
*/
ViewController.prototype.onUpdateDeepLinkAddress = function(e){
	//console.log('onUpdateDeepLinkAddress');
	this.onImplementDeepLinkAddress(e.path);
};

/**
* function checks path and determins if arteefact needs opening or closing
* @private
*/
ViewController.prototype.onImplementDeepLinkAddress = function(path){
	var id;
	var artefactData;
	if(path.indexOf('item-') > 0){
		id = parseInt(path.substr(6));
		artefactData = Globals.artefactDataManager.getArtefactDataWithId(id);
		if(artefactData !== false){
			if(this._infoWindow.isOpen() === false){
				console.log('ViewController open artefact window');
				this._artefactWindow.open(artefactData);
			}
		}else{
			//NO Such Artefact
			alert("Can't find Item "+id);
		}
	}else if(path === "/"){
		this._artefactWindow.close();
	}
};

/**
* called when InfoWindow is closed, we can then check for any deeplinks
* @private
*/
ViewController.prototype.onInfoWindowCloseHandler = function(){
	var path = Globals.deepLinkingManager.getAddress();
	this.onImplementDeepLinkAddress(path);
};


ViewController.prototype.onResize = function(e){
	this.updateGlobalWindowSize();
};

ViewController.prototype.updateGlobalWindowSize = function(){
	if(window.JQuery !== undefined){
		Globals.windowWidth = $(window).width();
		Globals.windowHeight = $(window).height();
	}else{
		Globals.windowWidth = window.innerWidth;
		Globals.windowHeight = window.innerHeight;
	}

};



//PUBLIC
//_________________________________________________________________________________
ViewController.prototype.releaseCycle = function(){
	
};

ViewController.prototype.onPopUpOpenHandler = function(){
	
};

ViewController.prototype.onPopUpCleanUpHandler = function(){
	if(this._isPopupOpen === true){
		this._artefactPopup.close();
		this._isPopupOpen = false;
		this._isPopupBlocked = true;
		this._popupBlockerTimer = setTimeout(this.clearPopupBlocker.context(this),500);
	}
};

ViewController.prototype.updateTapestryHACK = function(){
	this._tapestryViewController.refresh();
};

ViewController.prototype.onRelatedArtefactClick = function(data){
	this._artefactWindow.open(data);
};

ViewController.prototype.openVeil = function(options){
	this._veil.open(options);
};

ViewController.prototype.closeVeil = function(options){
	this._veil.close(options);
};

/**
 * Called by Main to init only after viewController has been set into Globals, as onInit creates objects that end up calling global
 */
ViewController.prototype.init = function(){
	this.onInit();
};






//Event Classes
//_________________________________________________________________________________________	
var ViewControllerEvent = function(eventType){
	this.eventType = eventType;
};
ViewControllerEvent.BUSY_START = "busyStart";
ViewControllerEvent.BUSY_COMPLETE = "busyComplete";