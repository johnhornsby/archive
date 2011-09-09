var ViewController = function(){
	EventDispatcher.call(this);
	
	//properties - visual
	this._artefactPopup;
	this._artefactWindow;
	this._busyFeebbackView;
	this._dockViewController;
	this._fullscreenWindow;
	this._infoWindow;
	this._progressFeedbackView;
	this._siteNavigationView;
	this._tapestryViewController;
	
	this._isPopupOpen = false;
	this._popupBlockerTimer;
	this._isPopupBlocked = false;
	
	this.init();
};
ViewController.prototype = new EventDispatcher();





//PRIVATE
//_________________________________________________________________________________
ViewController.prototype.init = function(){
	this.build();
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
	//this._artefactPopup.addEventListener(ArtefactPopupEvent.ARTEFACT_ADD_TO_FAVOURITES,this.onPopUpAddToFavouritesHandler.context(this));
	this._artefactPopup.addEventListener(ArtefactPopupEvent.ARTEFACT_REMOVE_FROM_FAVOURITES,this.onRemoveFromFavouritesHandler.context(this));
	this._artefactPopup.addEventListener(ArtefactPopupEvent.CLOSE,this.onPopUpCloseHandler.context(this));
	
	this._artefactWindow = new ArtefactWindow();
	this._artefactWindow.addEventListener(ArtefactWindowEvent.OPEN_FULL_SCREEN_WINDOW,this.onOpenFullScreenWindowHandler.context(this));
	this._artefactWindow.addEventListener(ArtefactWindowEvent.ARTEFACT_REMOVE_FROM_FAVOURITES,this.onRemoveFromFavouritesHandler.context(this));
	
	this._infoWindow = new InfoWindow();
	
	this._fullscreenWindow = new FullScreenWindow();
	
	if(Globals.localStorageManager.isShowInfoOnEnter() === true){
		this._infoWindow.open();	
	}
	
};

ViewController.prototype.onArtefactWindowAddToFavouritesHandler = function(){
	
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

ViewController.prototype.onRemoveFromFavouritesHandler = function(){
	if(Globals.artefactDataManager.getSelectionObject().isFavourite === true){			//if artefacts filter is on then update view
		//this._tapestryViewController.refresh();	
		//
		this._tapestryViewController.setSelectionObject(Globals.artefactDataManager.getSelectionObject());
	}
};

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
	this._fullscreenWindow.open(e.data);
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







//Event Classes
//_________________________________________________________________________________________	
var ViewControllerEvent = function(eventType){
	this.eventType = eventType;
};
ViewControllerEvent.BUSY_START = "busyStart";
ViewControllerEvent.BUSY_COMPLETE = "busyComplete";