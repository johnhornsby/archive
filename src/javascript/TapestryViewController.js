var TapestryViewController = function(){
	EventDispatcher.call(this);
	
	this._currentView;
	this._planeController;
	//this._categoryScrubberViewController;
	
	this._artefactsSelectionObject;
	
	this.init();
};
TapestryViewController.prototype = new EventDispatcher();





//PRIVATE
//__________________________________________________________________________________
TapestryViewController.prototype.init = function(){
	this.build();
	$(window).bind("resize",this.onResizeHandler.context(this));
};

TapestryViewController.prototype.build = function(){
	var interactiveElement = document.getElementById("interactivePlane");
	this._planeController = new PlaneController(interactiveElement);
	Globals.planeController = this._planeController;
	this._planeController.setDelegate(this);
	
	
	//this._categoryScrubberViewController = new CategoryScrubberViewController();
	
	
	
	this._currentView = new RandomCanvas();
	this._artefactsSelectionObject = new ArtefactsSelectionConfiguration();
	var selectionObject = new ArtefactsSelectionConfiguration();
	
	this.setSelectionObject(selectionObject);
};

TapestryViewController.prototype.onUpdate = function(){
	if(this._currentView !== undefined){
		this._currentView.update();
	}
};


TapestryViewController.prototype.onResizeHandler = function(e){
	if(this._currentView !== undefined){
		this._currentView.update();
	}
};

TapestryViewController.prototype.onSetSelectionObject = function(selectionObject){
	console.log("TapestryViewController.onSetSelectionObject()");
	this.dispatchEvent(new TapestryViewControllerEvent(TapestryViewControllerEvent.BUSY_START));
	Globals.artefactDataManager.addEventListener(ArtefactDataManagerEvent.SEARCH_END,this.onSearchEndHandler.rEvtContext(this));
	Globals.artefactDataManager.setSelectionObject(selectionObject);
	this._planeController.deactivate();
};

TapestryViewController.prototype.clearCurrentView = function(){
	this._currentView.destroy();
};

TapestryViewController.prototype.onSearchEndHandler = function(e){
	console.log("TapestryViewController.onSearchEndHandler()");
	
	if(Globals.artefactDataManager.getHasResults() === true){
		var feed = Globals.artefactDataManager.getFeed();
		
		var selectionObject = Globals.artefactDataManager.getSelectionObject();
		var containerElement = document.getElementById("plane");
		
		if(this._artefactsSelectionObject.category !== selectionObject.category){			//if category changes, commented out to debug onNoResultsHideCategory
			this._currentView.destroy();
			
			//TODO 
			//do this when making the view
			containerElement.style.left = "0px";
			containerElement.style.top = "0px";
			
			if(selectionObject.category === ArtefactDataManager.CATEGORY_NONE || selectionObject.category === ArtefactDataManager.CATEGORY_MY_ARCHIVE){
				this._currentView = new RandomCanvas();
				//this._categoryScrubberViewController.hide();
			}else{
				this._currentView = new CategoryTable();
				//this._categoryScrubberViewController.show();
			}
		}
		
		this._artefactsSelectionObject = selectionObject.clone();//clone as selectionObject is the dataManagers version
		
		Globals.artefactDataManager.removeEventListener(ArtefactDataManagerEvent.SEARCH_END,this.onSearchEndHandler.rEvtContext(this));	
		
		this._currentView.setData(feed);
		this._currentView.update();
	
	}else{
		alert("No Results");
		this.dispatchEvent(new TapestryViewControllerEvent(TapestryViewControllerEvent.NO_RESULTS));
	}
	
	
	this._planeController.activate();
	this.dispatchEvent(new TapestryViewControllerEvent(TapestryViewControllerEvent.BUSY_COMPLETE));
};






//PUBLIC PLANE DELEGATE METHODS
//_______________________________________________________________________________________
TapestryViewController.prototype.onSetScrollDelta = function(leftDelta,topDelta,left,top){
	this._currentView.setScrollDelta(leftDelta,topDelta,left,top);
	//if(this._currentView.constructor === CategoryTable){
		//this._categoryScrubberViewController.setScrollValue(this._currentView.getScrollValue());
	//}
};

TapestryViewController.prototype.onSingleClick = function(left,top){
	//artefactInformationObject = {data:{},bounds:{left,top,width,bottom},gridObject:{ocupied:false,data:undefined,visible:false,x:c,y:r,oX:0,oY:0,a:1}}
	var artefactInformationObject = this._currentView.getArtefactInformationAtPoint(new Point(left,top));
	if(artefactInformationObject.gridObject.ocupied === false) return false;
	this.dispatchEvent(new TapestryInteractionViewControllerEvent(TapestryInteractionViewControllerEvent.SINGLE_CLICK,artefactInformationObject.gridObject.data,artefactInformationObject.bounds));
};

TapestryViewController.prototype.onDoubleClick = function(left,top){
	//artefactInformationObject = {data:{},bounds:{left,top,width,bottom},gridObject:{ocupied:false,data:undefined,visible:false,x:c,y:r,oX:0,oY:0,a:1}}
	var artefactInformationObject = this._currentView.getArtefactInformationAtPoint(new Point(left,top));
	if(artefactInformationObject.gridObject.ocupied === false) return false;
	this.dispatchEvent(new TapestryInteractionViewControllerEvent(TapestryInteractionViewControllerEvent.DOUBLE_CLICK,artefactInformationObject.gridObject.data,artefactInformationObject.bounds));
};

TapestryViewController.prototype.onMouseDown = function(){
	this.dispatchEvent(new TapestryInteractionViewControllerEvent(TapestryInteractionViewControllerEvent.MOUSE_DOWN));
};

TapestryViewController.prototype.onDragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	this._currentView.dragEnd(finalLeftDelta,finalTopDelta,left,top);
};

TapestryViewController.prototype.setMouseWheelScrollDelta = function(delta){
	if(this._currentView.constructor === CategoryTable){
		this._currentView.setMouseWheelScrollDelta(delta);
	}
};
//PUBLIC
//___________________________________________________________________________________
/**
*@descrition delegate method called from PlaneController
*/
TapestryViewController.prototype.setScrollDelta = function(leftDelta,topDelta,left,top){
	this.onSetScrollDelta(leftDelta,topDelta,left,top);
};

TapestryViewController.prototype.singleClick = function(left,top){
	this.onSingleClick(left,top);
};

TapestryViewController.prototype.doubleClick = function(left,top){
	this.onDoubleClick(left,top);
};

TapestryViewController.prototype.mouseDown = function(){
	this.onMouseDown();
};

TapestryViewController.prototype.dragEnd = function(finalLeftDelta,finalTopDelta,left,top){
	this.onDragEnd(finalLeftDelta,finalTopDelta,left,top);
};




/**
*@description called from parent ViewController from dock change event
*/
TapestryViewController.prototype.setSelectionObject = function(selectionObject){
	this.onSetSelectionObject(selectionObject);
};

/**
@description  called from parent ViewController to refresh data if it should change, such as removing item from favourites
*/
TapestryViewController.prototype.refresh = function(){
	this.onSetSelectionObject(Globals.artefactDataManager.getSelectionObject());
};






//Event Classes
//_________________________________________________________________________________________	
var TapestryViewControllerEvent = function(eventType){
	this.eventType = eventType;
};
TapestryViewControllerEvent.BUSY_START = "busyStart";
TapestryViewControllerEvent.BUSY_COMPLETE = "busyComplete";
TapestryViewControllerEvent.NO_RESULTS = "noResults";

var TapestryInteractionViewControllerEvent = function(eventType,data,bounds){
	this.eventType = eventType;
	this.data = data;
	this.bounds = bounds;
};
TapestryInteractionViewControllerEvent.SINGLE_CLICK = "singleClick";
TapestryInteractionViewControllerEvent.DOUBLE_CLICK = "doubleClick";
TapestryInteractionViewControllerEvent.MOUSE_DOWN = "mouseDown";