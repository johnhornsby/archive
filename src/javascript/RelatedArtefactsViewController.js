var RelatedArtefactsViewController = function(){
	EventDispatcher.call(this);
	
	this._containerElement;
	this._data;
	
	this._relatedArtefactsDataArray;
	this._relatedArtefactFarLeftIndex = 0;
	this._relatedArtefactImagesLoadedIncrement = 0;
	this._relatedArtefactImagesLoadedStatus = false;
	
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
};


RelatedArtefactsViewController.prototype.createRelatedArtefact = function(data){
	var html = "";
	html += '<li class="relatedArtefact">';
	html += '<img src="'+Globals.ARTEFACT_IMAGES_FOLDER+data.id+'_11.jpg">';
	html += '<a><span>'+data.t+'</span></a>';
	html += '</li>';
	
	$("#relatedArtefactsContainer > ul").append(html);
	
	var imageJQObject = $("#relatedArtefactsContainer li").last().children().first();
	imageJQObject.bind('load',this.relatedArtefactImageLoaded.evtContext(this));
	var anchorJQObject = imageJQObject.next();
	anchorJQObject.bind('click',function(){
		Globals.viewController.onRelatedArtefactClick(data);
	});
	
};

RelatedArtefactsViewController.prototype.onRelatedArtefactClickHandler = function(e,data){
	Globals.viewController.onRelatedArtefactClick(data);
};


RelatedArtefactsViewController.prototype.relatedArtefactImageLoaded = function(e,imageObject){
	//console.log("relatedArtefactImageLoaded");
	$(imageObject).unbind('load');
	this._relatedArtefactImagesLoadedIncrement++;
	if(this._relatedArtefactImagesLoadedIncrement === this._relatedArtefactsDataArray.length){
		//console.log("relatedArtefactImageLoaded All");
		$(".relatedArtefact").each(function(){
			$(this).css("opacity","1");
		});
	}	
};


RelatedArtefactsViewController.prototype.removeRelatedArtefacts = function(){
	$("#relatedArtefactsContainer > ul").empty();
	$("#relatedArtefactsContainer > ul").css("left",0);
};


RelatedArtefactsViewController.prototype.onLeftCarouselClickHandler = function(e){
	var targetIndex = this._relatedArtefactFarLeftIndex - 5;
	if(targetIndex < 0){
		return false;
	}
	var destinationX  = (targetIndex * Globals.TILE_WIDTH) * -1;
	this._relatedArtefactFarLeftIndex = targetIndex;
	
	//$("#relatedArtefactsContainer > ul").css("left",destinationX);
	
	//console.log("onLeftCarouselClickHandler targetIndex:"+targetIndex+" destinationX:"+destinationX+" ul left:"+$("#relatedArtefactsContainer > ul").get(0).offsetLeft);
	
	this.slideToIndexXPos(destinationX);
	
};


RelatedArtefactsViewController.prototype.onRightCarouselClickHandler = function(e){
	var targetIndex = this._relatedArtefactFarLeftIndex + 5;
	if(targetIndex >= this._relatedArtefactsDataArray.length){
		return false;
	}
	var destinationX  = (targetIndex * Globals.TILE_WIDTH) * -1;
	this._relatedArtefactFarLeftIndex = targetIndex;
	
	//$("#relatedArtefactsContainer > ul").css("left",destinationX + "px");
	
	//console.log("onRightCarouselClickHandler targetIndex:"+targetIndex+" destinationX:"+destinationX+" ul left:"+$("#relatedArtefactsContainer > ul").get(0).offsetLeft);
	
	this.slideToIndexXPos(destinationX);
	
	
};


RelatedArtefactsViewController.prototype.slideToIndexXPos = function(destinationX){
	jTweener.addTween($("#relatedArtefactsContainer > ul").get(0), {
		time: 0.75,
		transition: 'easeOutQuad',
		left: destinationX,
		onUpdate:this.forceUpdate,
		onComplete:this.removeForceUpdates
	});
	/*
	$('#relatedArtefactsContainer > ul').animate({ left: destinationX + "px" }, {
		easing: "ease",
		duration: 1000,
		step: this.forceUpdate,
		complete: this.slideAnimationComplete
	});
	*/
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




//PUBLIC
//___________________________________________________________________________
RelatedArtefactsViewController.prototype.setData = function(jsonDataObject){
	this._data = jsonDataObject;
	$("#relatedArtefactsContainer > ul").css("left",0);

	this._relatedArtefactsDataArray = Globals.artefactDataManager.getRelatedArtefacts(this._data);
	var relatedArtefactData;
	for(var i=0; i< this._relatedArtefactsDataArray.length;i++){
		relatedArtefactData = this._relatedArtefactsDataArray[i];
		this.createRelatedArtefact(relatedArtefactData);
	}
};

RelatedArtefactsViewController.prototype.clear = function(){
	jTweener.removeTween($("#relatedArtefactsContainer > ul").get(0));
	this.removeForceUpdates();
	this.removeRelatedArtefacts();
	this._relatedArtefactsDataArray = [];
	this._relatedArtefactFarLeftIndex = 0;
	this._relatedArtefactImagesLoadedIncrement = 0;
	this._relatedArtefactImagesLoadedStatus = false;
	
};

RelatedArtefactsViewController.prototype.animateIn = function(){
	
};

