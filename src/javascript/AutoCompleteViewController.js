var AutoCompleteViewController = function(textField,dockViewController){
	EventDispatcher.call(this);
	
	this._textField = textField;
	this._dockViewController = dockViewController;
	this._suggestionListContainer;
	
	this.suggestions = new Array("Boris", "Bäcker", "Peter", "Test","Bums");
	this.outp;
	this.oldins;
	this._listIndex = -1;
	this.words = new Array();
	this.input;
	this.key;
	
	this._checkInterval;
	this._isMouseDown = false;
	
	this._originX = 0;
	this._originY = 0;
	this._lastX = 0;
	this._lastY = 0;
	this._leftDelta;
	this._topDelta;
	this._isDragging = false;
	this._downStartTime;
	this._isStopChildMouseUp = false;
	
	this._touchPanelViewController;
	
	
	this.init();
	
};
AutoCompleteViewController.prototype = new EventDispatcher();

AutoCompleteViewController.MOUSE_DRAG_MODIFIER = 2;
AutoCompleteViewController.CLICK_THRESHOLD_DURATION = 250 // milliseconds 500
AutoCompleteViewController.CLICK_THRESHOLD_DISTANCE = 10 // pixels


//PRIVATE
//________________________________________________________________________________
AutoCompleteViewController.prototype.init = function(){
	console.log('AutoCompleteViewController init');
	this._touchPanelViewController = new TouchScrollPanel({scrollDirection:TouchScrollPanel.SCROLL_DIRECTION_VERTICAL, frameElement:document.getElementById('autoCompleteShadow'), contentElement:document.getElementById('autoCompleteOutput')});
	//
	this._suggestionListContainer = document.getElementById("autoCompleteShadow");
	this.outp = document.getElementById("autoCompleteOutput");
	
	this.setVisible("hidden");
	
	$(this._textField).bind('focus',this.onTextFieldFocus.context(this));
	$(this._textField).bind('blur',this.onTextFieldBlur.context(this));
	
	
	$(document).bind('keydown',this.keygetter.context(this));
	$(document).bind('keyup',this.keyHandler.context(this));
	
	
	$('#dockVeil').bind('mousedown',this.dockVeilDown.context(this));
	$('#dockVeil').bind('mouseup',this.dockVeilUp.context(this));
	$('#dockVeil').bind('touchstart',this.dockVeilDown.context(this));
	/*
	$('#autoCompleteShadow').bind('mousewheel',this.onMouseWheel.context(this));
	$('#autoCompleteShadow').bind('mousedown',this.onMouseDownContainer.context(this));
	$('#autoCompleteShadow').bind('touchstart',this.onMouseDownContainer.context(this));
	*/
};

AutoCompleteViewController.prototype.onTextFieldFocus = function(e){
	Globals.log('onTextFieldFocus');
	this.showVeil();
	this._checkInterval = setInterval(this.lookAt.context(this), 100);
};

AutoCompleteViewController.prototype.onTextFieldBlur = function(e){
	//alert('onTextFieldBlur');
	Globals.log('onTextFieldBlur');
	clearInterval(this._checkInterval);
	if(this._isMouseDown === false){
		this.setVisible("hidden");
		this.hideVeil();
	}
};

AutoCompleteViewController.prototype.dockVeilUp = function(e){
	if(this._touchPanelViewController.isDragging() === false){
		if(this._touchPanelViewController.isStopChildMouseUp() === false){
			this.dismiss();
		}
	}
	this.captureEvent();
};
AutoCompleteViewController.prototype.dockVeilDown = function(e){
	this.dismiss();
	this.captureEvent();
};

AutoCompleteViewController.prototype.dismiss = function(e){
	$(this._textField)[0].blur();	/*close keyboard on ios */
	this.setVisible("hidden");
	this.hideVeil();
	this._isMouseDown = false;
};

AutoCompleteViewController.prototype.captureEvent = function(e){
	//console.log('captureEvent');
	
	e.preventDefault();
	return false;
};

AutoCompleteViewController.prototype.setVisible = function(visi){
	this._suggestionListContainer.style.position = 'absolute';
	//this._suggestionListContainer.style.bottom =  50 + "px";	//set in css
	this._suggestionListContainer.style.left = (this.findPosX(this._textField))+"px";
	this._suggestionListContainer.style.visibility = visi;
	
	//every time we reveal set scroll to top, and update the thumb size
	this._touchPanelViewController.setScrollY(this._touchPanelViewController.getScrollMinY());
	this._touchPanelViewController.updateThumb();
	
	//reset scroll index
	this.oldins = "";
	this._listIndex = -1;
};

AutoCompleteViewController.prototype.hideVeil = function(){
	console.log('hideVeil');
	$('#dockVeil').css('opacity','0');
	$("#dockVeil").css("display","none");
	
};

AutoCompleteViewController.prototype.showVeil = function(){
	console.log('showVeil');
	$("#dockVeil").css("display","block");
	$('#dockVeil').css('opacity','1');
};


AutoCompleteViewController.prototype.findPosX = function (obj){
	var curleft = 0;
	if (obj.offsetParent){
		while (obj.offsetParent){
			curleft += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	}
	else if (obj.x)
		curleft += obj.x;
	return curleft;
}

AutoCompleteViewController.prototype.findPosY = function(obj){
	var curtop = 0;
	if (obj.offsetParent){
		curtop += obj.offsetHeight;
		while (obj.offsetParent){
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		}
	}
	else if (obj.y){
		curtop += obj.y;
		curtop += obj.height;
	}
	return curtop;
}
	
AutoCompleteViewController.prototype.lookAt = function(){
	var ins = this._textField.value;
	if (this.oldins == ins) return;
	else if (this._listIndex > -1);
	else if (ins.length > 0){
		this.words = this.getWord(ins);
		if (this.words.length > 0){
			this.clearOutput();
			for (var i=0;i < this.words.length; ++i) this.addWord(this.words[i]);
			this.setVisible("visible");
			this.input = this._textField.value;
		}
		else{
			this.setVisible("hidden");
			this._listIndex = -1;
		}
	}
	else{
		this.setVisible("hidden");
		this._listIndex = -1;
	}
	this.oldins = ins;
};
	
AutoCompleteViewController.prototype.addWord = function(word){
	var sp = document.createElement("div");
	sp.appendChild(document.createTextNode(word));
	/*
	sp.onmouseover = this.mouseHandler;
	sp.onmouseout = this.mouseHandlerOut;
	sp.onclick = this.mouseClick;
	*/
	$(sp).bind('mouseover',this.mouseHandler.evtContext(this));
	$(sp).bind('mouseout',this.mouseHandlerOut.evtContext(this));
	$(sp).bind('click',this.mouseClick.evtContext(this));
	$(sp).bind('mousedown',this.mouseDownHandler.evtContext(this));
	$(sp).bind('mouseleave',this.mouseLeaveHandler.evtContext(this));
	
	this.outp.appendChild(sp);
};
	
AutoCompleteViewController.prototype.clearOutput = function(){
	var child;
	while (this.outp.hasChildNodes()){
		child = this.outp.firstChild;
		this.outp.removeChild(child);
	}
	this._listIndex = -1;
};
	
AutoCompleteViewController.prototype.getWord = function(beginning){
	var words = new Array();
	this.suggestions = Globals.dataManager.getAutoCompleteKeywordArray();
	for (var i=0;i < this.suggestions.length; ++i){
		var j = -1;
		var correct = 1;
		while (correct == 1 && ++j < beginning.length){
			if (this.suggestions[i].charAt(j) != beginning.charAt(j)){
				if (this.suggestions[i].charAt(j) != beginning.charAt(j).toUpperCase())
				 correct = 0;
			}
		}
		if (correct == 1) words[words.length] = this.suggestions[i];
	}
	return words;
};
	
AutoCompleteViewController.prototype.setColor = function(_posi, _color, _forg){
	this.outp.childNodes[_posi].style.background = _color;
	this.outp.childNodes[_posi].style.color = _forg;
};
	
AutoCompleteViewController.prototype.keygetter = function(event){
	if (!event && window.event) event = window.event;
	if (event) this.key = event.keyCode;
	else this.key = event.which;
};
		
AutoCompleteViewController.prototype.keyHandler = function(event){
	console.log('posi:'+this._listIndex);
	if (document.getElementById("autoCompleteShadow").style.visibility == "visible"){
		if (this.key == 40){ //Key down
			//alert (words);
			if (this.words.length > 0 && this._listIndex < this.words.length-1){
				if (this._listIndex >=0) {
					this.setColor(this._listIndex, "#fff", "black");
				}else{
					this.input = this._textField.value;
				}
				this.setColor(++this._listIndex, "#0091f7", "white");
				this._textField.value = this.outp.childNodes[this._listIndex].firstChild.nodeValue;
			}
		}else if (this.key == 38){ //Key up
			if (this.words.length > 0){
				if (this._listIndex >=1){
					this.setColor(this._listIndex, "#fff", "black");
					this.setColor(--this._listIndex, "#0091f7", "white");
					this._textField.value = this.outp.childNodes[this._listIndex].firstChild.nodeValue;
				}else if(this._listIndex === 0){
					this.setColor(this._listIndex, "#fff", "black");
					this._textField.value = this.input;
					this._textField.focus();
					this._listIndex--;
				}else if(this._listIndex === -1){
					this._listIndex = this.words.length -1;
					this.setColor(this._listIndex, "#fff", "black");
					this._textField.value = this.input;
					this._textField.focus();
				}
			}
		}
		else if (this.key == 27){ // Esc
			this._textField.value = this.input;
			this.setVisible("hidden");
			this._listIndex = -1;
			this.oldins = this.input;
		}
		else if (this.key == 8){ // Backspace
			this._listIndex = -1;
			this.oldins=-1;
		}
	}
}
	
AutoCompleteViewController.prototype.mouseHandler = function(e,el){
	for (var i=0; i < this.words.length; ++i)
		this.setColor (i, "white", "black");
	if(this._touchPanelViewController.isDragging() === false){
		if(this._touchPanelViewController.isStopChildMouseUp() === false){
	//if(this._isDragging === false ){
		//if(this._isStopChildMouseUp === false){
			
			el.style.background = "#0091f7";
			el.style.color= "white";
		}
	}
}
	
AutoCompleteViewController.prototype.mouseHandlerOut = function(e,el){
		el.style.background = "white";
		el.style.color= "black";
	}
	
AutoCompleteViewController.prototype.mouseClick = function(e,el){
	//this._textField.value = el.firstChild.nodeValue;
	if(this._touchPanelViewController.isStopChildMouseUp() === false){
	//if(this._isStopChildMouseUp === false){
		console.log('mouseClick');
		this._isMouseDown = false;
		this.setVisible("hidden");
		this.hideVeil();
		this._listIndex = -1;
		this.oldins = el.firstChild.nodeValue;
		
		this._dockViewController.setKeywordAndSubmit(el.firstChild.nodeValue);
	}else{
		console.log('mouseClick canceled');	
	}
}
	
	
AutoCompleteViewController.prototype.mouseDownHandler = function(e){
	console.log('mouseDownHandler');
	/*
	On desktop this will cause the tf to loose focus, so we either deal with the event here, or do not hide the autoComplete on mouseDown 
	*/
	this._isMouseDown = true;
}

AutoCompleteViewController.prototype.mouseLeaveHandler = function(e){
	console.log('mouseLeaveHandler');
	this._isMouseDown = false;
	
}