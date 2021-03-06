var ImageView = function(data,container,scaleMode,imagePostFix){
	//Inheritance
	EventDispatcher.call(this);
	
	this._data = data;
	this._containerElement = container;
	this._imageElement;
	this._scaleMode = scaleMode || 0;
	this._status = 0;
	this._imagePostFix = imagePostFix || "";
	
	//this.init();	//now called via public load();
};
//Inheritance
ImageView.prototype = new EventDispatcher();

ImageView.SCALE_MODE_SCALE_TO_FIT = 0;
ImageView.SCALE_MODE_SCALE_TO_FILL = 1;

ImageView.STATUS_INIT = 0;
ImageView.STATUS_LOADING = 1;
ImageView.STATUS_LOADED = 2;





//PRIVATE
//__________________________________________________________________
ImageView.prototype.init = function(){
	this._containerElement = $(this._containerElement).get(0);
	$(window).bind("resize",this.onResize.rEvtContext(this));
	this.loadImage();
};

ImageView.prototype.loadImage = function(){
	this._imageElement = new Image();
	this._imageElement.onload = this.imageLoadComplete.context(this);
	this._imageElement.onabort = this.imageLoadAbort.context(this);
	this._imageElement.onerror = this.imageLoadError.context(this);
	this._imageElement.src = Globals.ARTEFACT_IMAGES_FOLDER+this._data.id + this._imagePostFix + '.jpg';
	this._status = ImageView.STATUS_LOADING;
};

ImageView.prototype.imageLoadError = function(e){
	console.log("imageLoadError");
};


ImageView.prototype.imageLoadAbort = function(e){
	console.log("imageLoadAbort");
};

ImageView.prototype.imageLoadComplete = function(e){
	attr(this._imageElement,"class","imageViewImage");
	$(this._containerElement).prepend(this._imageElement);	//container can container a veilLoader so prepend to add behind any loader	
	this.updatePosition();
	this._status = ImageView.STATUS_LOADED;
	var self = this;
	setTimeout(function(){
		self.dispatchEvent(new ImageViewEvent(ImageViewEvent.IMAGE_LOADED));
	},0);
};

ImageView.prototype.onResize = function(e){
	this.updatePosition();
}
ImageView.prototype.updatePosition = function(){
	var image = this._imageElement;
	var imageWidth;
	var imageHeight;
	var frameWidth;
	var frameHeight;
	var frameRatio;
	var imageRatio;
	var imageScaledWidth;
	var imageScaledHeight;
	var scaleMode = 0;
	
	imageWidth = image.width;
	imageHeight = image.height;
	imageRatio = imageWidth / imageHeight;
	
	frameWidth = this._containerElement.clientWidth;
	frameHeight = this._containerElement.clientHeight;
	frameRatio = frameWidth / frameHeight;
	
	if(scaleMode === ImageView.SCALE_MODE_SCALE_TO_FIT){				//SCALE to FIT
		if(imageRatio > frameRatio){	//calculate using width
			imageScaledWidth = frameWidth;
			imageScaledHeight = Math.round(imageHeight * (frameWidth / imageWidth))
			image.style.width = imageScaledWidth +"px";
			image.style.height = imageScaledHeight +"px";
			image.style.left = "0px";
			image.style.top = Math.round((frameHeight - imageScaledHeight)/2) +"px"; 
		}else{							//calculate using height
			imageScaledWidth = Math.round(imageWidth * (frameHeight / imageHeight));
			imageScaledHeight = frameHeight;
			image.style.height = imageScaledHeight +"px";
			image.style.width = imageScaledWidth +"px";
			image.style.left = Math.round((frameWidth - imageScaledWidth)/2) +"px"; 
			image.style.top = "0px";
		}
	}else{								//SCALE to FILL
		if(imageRatio > frameRatio){	//calculate using height
			imageScaledWidth = Math.round(imageWidth * (frameHeight / imageHeight));
			imageScaledHeight = frameHeight;
			image.style.height = imageScaledHeight +"px";
			image.style.width = imageScaledWidth +"px";
			image.style.left = Math.round((frameWidth - imageScaledWidth)/2) +"px"; 
			image.style.top = "0px";
		}else{							//calculate using width
			imageScaledWidth = frameWidth;
			imageScaledHeight = Math.round(imageHeight * (frameWidth / imageWidth))
			image.style.width = imageScaledWidth +"px";
			image.style.height = imageScaledHeight +"px";
			image.style.left = "0px";
			image.style.top = Math.round((frameHeight - imageScaledHeight)/2) +"px";
			
		}
	}
	image.style.position = "absolute";
};





//PUBLIC
//_________________________________________________________________________________
/**
* Called by superview to update position in responce to resize
*/
ImageView.prototype.update = function(){
	this.updatePosition();
};

ImageView.prototype.destroy = function(){
	$(this._imageElement).remove();
	if(this._status === ImageView.STATUS_LOADING){
		this._imageElement.onload = undefined;
		this._imageElement.onabort = undefined;
		this._imageElement.onerror = undefined;
		this._imageElement = undefined;
		this._imageElement.src = "";
		delete this._imageElement;
	}
	$(window).unbind("resize",this.onResize.rEvtContext(this));
};

/**
* load method now calls init, this allows for listeners to be added after constuctor
*/
ImageView.prototype.load = function(){
	this.init();
};





//EVENT CLASS
//_________________________________________________________________________________________	
var ImageViewEvent = function(eventType,data){
	this.eventType = eventType;
	this.data = data;
};
ImageViewEvent.IMAGE_LOADED = "imageLoaded";
