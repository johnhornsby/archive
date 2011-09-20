var AnimationLayer = function(){
	EventDispatcher.call(this);
	
	this._animationLayer = $('#animationLayer')[0];
	this._animationObjectArray = [];
	
};
AnimationLayer.prototype = new EventDispatcher();




//PUBLIC
//_______________________________________________________________________________________
AnimationLayer.prototype.addToArchiveFromGridAnimation = function(data,imageBounds,archiveButtonBounds){
	var animationObject = {};
	animationObject.element = document.createElement("div");
	attr(animationObject.element,"class","animationTile");
	//$(this._animationLayer).append(animationObject.element);
	append(this._animationLayer,animationObject.element);
	
	//determin image size
	var imageSize = String(imageBounds.width / Globals.TILE_WIDTH) + String(imageBounds.height / Globals.TILE_HEIGHT);
	
	animationObject.element.style.backgroundImage = 'url(' + Globals.ARTEFACT_IMAGES_FOLDER + data.id + '_' + imageSize + '.jpg)';
	animationObject.element.style.top = imageBounds.top + 'px';
	animationObject.element.style.left = imageBounds.left + 'px';
	animationObject.element.style.width = imageBounds.width + 'px';
	animationObject.element.style.height = imageBounds.height + 'px';
	
	
};