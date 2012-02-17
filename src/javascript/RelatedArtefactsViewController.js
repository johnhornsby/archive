var RelatedArtefactsViewController = function(){
	EventDispatcher.call(this);
	
	this._containerElement;
	this._data;
	
	this._relatedArtefactsDataArray;
	this._relatedArtefactFarLeftIndex = 0;
	this._relatedArtefactImagesLoadedIncrement = 0;
	this._relatedArtefactImagesLoadedStatus = false;
	
	
	this._scrollableTable;
	this._scrollablePanel;
	
	this.init();
};
RelatedArtefactsViewController.prototype = new EventDispatcher();





//PRIVATE
//_____________________________________________________________________________________
RelatedArtefactsViewController.prototype.init = function(){
	$("#relatedArtefactsView .leftCarouselButton").bind("click",this.onLeftCarouselClickHandler.context(this));
	$("#relatedArtefactsView .rightCarouselButton").bind("click",this.onRightCarouselClickHandler.context(this));
	
	/*
	HACK
	When the Vimo iframe is loaded into the ArtefactWindow, this seems to create some conflict that causes the iPad browser 
	to not update on changes to css styles like 'left'. A change to the dom will force the browser to update.
	
	This causes problems for the slidding related artefacts on a video artefact window.
	
	I currently have no idea why this happens, so I have created the following workaround that adds a empty div to the dom 
	after every animation frame update, onComplete and clear the forcedDomUpdatesContainer is emptied.
	*/
	$("#relatedArtefactsView").append('<div id="forcedDomUpdatesContainer"></div>');
	
	this._scrollableTable = new ScrollableTable({
		direction: ScrollableTable.DIRECTION_HORIZONTAL,
		cellClass: RelatedArtefactCell,
		dataDelegate: this,
		delegate: this,
		containerElement: $("#relatedArtefactsContainer").get(0),
		frameElement: $("#relatedArtefactsFrame").get(0),
		cellWidth: 113,
		cellHeight: 140
	});
	this._scrollableTable.addEventListener(ScrollableTableEvent.CELL_CLICK,this.onTableCellClick.context(this));

	this._scrollablePanel = new TouchScrollableTablePanel({
		frameElement: $("#relatedArtefactsFrame").get(0),
		contentElement: $("#relatedArtefactsContainer").get(0),
		scrollDirection:TouchScrollPanel.SCROLL_DIRECTION_HORIZONTAL,
		scrollableTable:this._scrollableTable
	});

};

RelatedArtefactsViewController.prototype.onTableCellClick = function(e){
	if(this._scrollablePanel.isStopChildMouseUp() === false){
		Globals.viewController.onRelatedArtefactClick(e.data);
	}else{
		Globals.log("onRelatedArtefactClickHandler canceled");
	}
};

RelatedArtefactsViewController.prototype.onLeftCarouselClickHandler = function(e){
	this._scrollablePanel.scrollToPreviousPage();
};


RelatedArtefactsViewController.prototype.onRightCarouselClickHandler = function(e){
	this._scrollablePanel.scrollToNextPage();
};

/**
*@description: add a div to the forcedDomUpdatesContainer, this forces the ipad browser to update changes to the display, this is called in the above slideToIndexXPos() function
*/
RelatedArtefactsViewController.prototype.forceUpdate = function(){
	$("#forcedDomUpdatesContainer").append("<div></div>");
};

/**
*@description: once the slide animation is complete remove all of the empty div from the forcedDomUpdatesContainer, this is called on clear() and onComplete event of the jTweener animation
*/
RelatedArtefactsViewController.prototype.removeForceUpdates = function(){
	$("#forcedDomUpdatesContainer").empty();
};





//SCROLLABLE TABLE DATA DELEGATE METHODS
//__________________________________________________________________________
RelatedArtefactsViewController.prototype.getNumberOfCells = function(){
	return this._relatedArtefactsDataArray.length;
}

RelatedArtefactsViewController.prototype.getDataForCellIndex = function(index){
	return this._relatedArtefactsDataArray[index];
}





//PUBLIC
//___________________________________________________________________________
RelatedArtefactsViewController.prototype.setData = function(jsonDataObject){
	this._data = jsonDataObject;
	this._relatedArtefactsDataArray = Globals.artefactDataManager.getRelatedArtefacts(this._data);
	this._scrollableTable.reloadTable();
	this._scrollablePanel.clear();
	this._scrollablePanel.setScrollX(0);
	this._scrollablePanel.updateThumb();
};

RelatedArtefactsViewController.prototype.clear = function(){
	this._scrollablePanel.clear();
	this._relatedArtefactsDataArray = [];
	this._relatedArtefactFarLeftIndex = 0;
	this._relatedArtefactImagesLoadedIncrement = 0;
	this._relatedArtefactImagesLoadedStatus = false;
	
};
