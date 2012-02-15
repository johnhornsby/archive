var TouchScrollableTablePanel = function(options){
	TouchScrollPanel.call(this,options);
	if(options === undefined) return;				// inheritance handling
	
	this._scrollableTable = options.scrollableTable;
	this._isAnimating = false;
	
};
//inheritance
TouchScrollableTablePanel.prototype = new TouchScrollPanel();
TouchScrollableTablePanel.prototype.constructor = TouchScrollableTablePanel;
TouchScrollableTablePanel.prototype.supr = TouchScrollPanel.prototype;

//OVERRIDE
//__
TouchScrollableTablePanel.prototype.updateDomScrollPosition = function(){
	/*
	if(this._scrollDirection === TouchScrollPanel.SCROLL_DIRECTION_VERTICAL){
		this._contentElement.style.top = this._y+"px";
	
	}else{
		this._contentElement.style.left = this._x+"px";
	}
	*/
	this._scrollableTable.setScrollRect({left:this._x, top:this._y, width:this._frameElement.clientWidth, height:this._frameElement.clientHeight});
	this.updateScrollThumbPosition();
};