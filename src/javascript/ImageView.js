var ImageView = function(data,container,scaleMode,imagePostFix){
	
	
	this._data = data;
	this._containerElement = container;
	this._imageElement;
	this._scaleMode = scaleMode || 0;
	this._status = 0;
	this._imagePostFix = imagePostFix || "";
	
	this.init();
};
ImageView.SCALE_MODE_SCALE_TO_FIT = 0;
ImageView.SCALE_MODE_SCALE_TO_FILL = 1;

ImageView.STATUS_INIT = 0;
ImageView.STATUS_LOADING = 1;
ImageView.STATUS_LOADED = 2;





//PRIVATE
//__________________________________________________________________
ImageView.prototype.init = function(){
	this._containerElement = $(this._containerElement).get(0);
	$(window).bind("resize",this.onUpdate.rEvtContext(this));
	this.loadImage();
};

ImageView.prototype.loadImage = function(){
	
	//$("#artefactWindowMediaView").append('<img id="artefactWindowMediaViewImage" src="'++'">');
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
	//$("#artefactWindowMediaViewImage").attr( attributeName, value )
	//$("#artefactWindowMediaView").append('<img id="artefactWindowMediaViewImage" src="'+this._imageElement.src+'">');
	//$(this._containerElement).append(image);
	
	append(this._containerElement,this._imageElement);
	
	this.onUpdate();
	this._status = ImageView.STATUS_LOADED;
};



ImageView.prototype.onUpdate = function(e){
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
ImageView.prototype.update = function(){
	this.onUpdate();
};


ImageView.prototype.destroy = function(){
	$(this._imageElement).remove();
	if(ImageView.STATUS_LOADING){
		this._imageElement.src = "";
		this._imageElement.onload = undefined;
		this._imageElement.onabort = undefined;
		this._imageElement.onerror = undefined;
		this._imageElement = undefined;
		delete this._imageElement;
	}
	$(this._containerElement).empty();
	//cancel loading
	$(window).unbind("resize",this.onUpdate.rEvtContext(this));
	//remove image from dom
	
};