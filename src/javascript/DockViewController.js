var DockViewController = function(viewController){
	EventDispatcher.call(this);
	
	this._viewController = viewController;
	this._artefactsSelectionObject;
	this._autoCompleteViewController;
	
	this._savedHomeSelectionObject;
	
	this._buttonBackOffCSS = 'rgba(204,0,51,1)';
	this._buttonBackOnCSS = 'rgba(0,0,0,1)';
	
	this._isFilterMenuOpen = false;
	
	this.init();
};
DockViewController.prototype = new EventDispatcher();




//PRIVATE
//_________________________________________________________________________________________
DockViewController.prototype.init = function(){
	this._artefactsSelectionObject = new ArtefactsSelectionConfiguration();
	this._savedHomeSelectionObject = new ArtefactsSelectionConfiguration();
	this._autoCompleteViewController = new AutoCompleteViewController(document.getElementById("dockSearchField"),this);
	this.build();
	this._viewController.addEventListener(ViewControllerEvent.BUSY_START,this.deactivate.context(this));
	this._viewController.addEventListener(ViewControllerEvent.BUSY_COMPLETE,this.activate.context(this));
};

DockViewController.prototype.build = function(){
	$("#dockHomeButton").css("background-color",this._buttonBackOnCSS);
	//$('#dockSubMenu').css('bottom','75px');
	//$('#dockSubMenu').css('opacity','0');
	$('#dockSubMenu').css('display','none');
	
};

DockViewController.prototype.closeFilterMenu = function(){
	if(this._isFilterMenuOpen === true){
		//$('#dockSubMenu').css('bottom','75px');
		//$('#dockSubMenu').css('opacity','0');
		//$('#dockSubMenu').css('webkitAnimationName','filterMenuOutAnimation');
		$('#dockSubMenu').css('display','none');
		this._isFilterMenuOpen = false;
	}
};

DockViewController.prototype.openFilterMenu = function(){
	if(this._isFilterMenuOpen === false){
		var menuLeft = $('#dockShowFiltersButton')[0].offsetLeft;
		$('#dockSubMenu').css('left',menuLeft+'px');
		//$('#dockSubMenu').css('bottom','55px');
		//$('#dockSubMenu').css('opacity','1');
		$('#dockSubMenu').css('display','block');
		//$('#dockSubMenu').attr('class','filterMenuIn');
		//$('#dockSubMenu').css('webkitAnimationName','filterMenuInAnimation');
		this._isFilterMenuOpen = true;
		this.updateFilterMenu();
	}
};

DockViewController.prototype.updateFilterMenu = function(){
	if(this._artefactsSelectionObject.filters.length > 0){
		if(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_PHOTO) > -1){
			$('#filterPhotosButton').attr('class','checkBoxSelected');
		}else{
			$('#filterPhotosButton').attr('class','checkBoxUnSelected');
		}
		if(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_POSTERS) > -1){
			$('#filterPostersButton').attr('class','checkBoxSelected');
		}else{
			$('#filterPostersButton').attr('class','checkBoxUnSelected');
		}
		if(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_VIDEO) > -1){
			$('#filterVideoButton').attr('class','checkBoxSelected');
		}else{
			$('#filterVideoButton').attr('class','checkBoxUnSelected');
		}
		if(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_AUDIO) > -1){
			$('#filterAudioButton').attr('class','checkBoxSelected');
		}else{
			$('#filterAudioButton').attr('class','checkBoxUnSelected');
		}
	}else{
		$('#filterPhotosButton').attr('class','checkBoxSelected');
		$('#filterPostersButton').attr('class','checkBoxSelected');
		$('#filterVideoButton').attr('class','checkBoxSelected');
		$('#filterAudioButton').attr('class','checkBoxSelected');
	}
}

DockViewController.prototype.onDockButtonTapHandler = function(e){
	console.log("onDockButtonTapHandler:");
};


DockViewController.prototype.onDockButtonMouseUpHandler = function(e){
	console.log('onDockButtonMouseUpHandler:'+e.currentTarget.innerHTML);
	this.dockButtonActivated(e.currentTarget.innerHTML,e.currentTarget.id);
};

DockViewController.prototype.dockButtonActivated = function(label,id){
	var hasSelectionChanged = false;
	
	//if we are home and we are relocating view then save filters and keywords
	//this is a quick patch to remove filters and search from non home views
	//the filters will be restored when we arrive back to home form another
	if(this._artefactsSelectionObject.category === ArtefactDataManager.CATEGORY_NONE && (label === "My Archive" || label === "Year" || label === "Production") ){
		this._savedHomeSelectionObject = this._artefactsSelectionObject.clone();
		this._artefactsSelectionObject.filters = [];
		this._artefactsSelectionObject.keywordsArray = [];
		this._artefactsSelectionObject.isFavourite = false;
		$("#dockShowFiltersButton").css('opacity','0.3');
		$("#dockSearchField").css('opacity','0.3');
		$("#dockSearchResetButton").css('opacity','0.3');
		$("#dockSearchButton").css('opacity','0.3');
	}
	
	//restore any filters
	if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_NONE && label === "Home" ){
		this._artefactsSelectionObject.filters = this._savedHomeSelectionObject.filters
		this._artefactsSelectionObject.keywordsArray = this._savedHomeSelectionObject.keywordsArray;
		this._artefactsSelectionObject.isFavourite = false;
		$("#dockShowFiltersButton").css('opacity','1');
		$("#dockSearchField").css('opacity','1');
		$("#dockSearchResetButton").css('opacity','1');
		$("#dockSearchButton").css('opacity','1');
	}
	
	
	
                    
	
	switch(id){
		case "dockResetButton":
			this._artefactsSelectionObject.category = ArtefactDataManager.CATEGORY_NONE;
			this._artefactsSelectionObject.filters = [];
			this._artefactsSelectionObject.keywordsArray = [];
			this._artefactsSelectionObject.isFavourite = false;
			hasSelectionChanged = true;
			this.closeFilterMenu();
			break;
		case "dockHomeButton":
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_NONE){
				$("#dockHomeButton").css("background-color",this._buttonBackOnCSS)
				$("#dockYearButton").css("background-color",this._buttonBackOffCSS);
				$("#dockProductionButton").css("background-color",this._buttonBackOffCSS);
				$("#dockMyArchiveButton").css("background-color",this._buttonBackOffCSS);
				this._artefactsSelectionObject.category = ArtefactDataManager.CATEGORY_NONE;
				this._artefactsSelectionObject.isFavourite = false;
				hasSelectionChanged = true;
			}
			this.closeFilterMenu();
			break;
		case "dockYearButton":
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_YEAR){
				$("#dockHomeButton").css("background-color",this._buttonBackOffCSS)
				$("#dockYearButton").css("background-color",this._buttonBackOnCSS);
				$("#dockProductionButton").css("background-color",this._buttonBackOffCSS);
				$("#dockMyArchiveButton").css("background-color",this._buttonBackOffCSS);
				this._artefactsSelectionObject.category = ArtefactDataManager.CATEGORY_YEAR;
				this._artefactsSelectionObject.isFavourite = false;
				hasSelectionChanged = true;
			}
			this.closeFilterMenu();
			break;
		case "dockProductionButton":
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_PRODUCTION){
				$("#dockHomeButton").css("background-color",this._buttonBackOffCSS)
				$("#dockYearButton").css("background-color",this._buttonBackOffCSS);
				$("#dockProductionButton").css("background-color",this._buttonBackOnCSS);
				$("#dockMyArchiveButton").css("background-color",this._buttonBackOffCSS);
				this._artefactsSelectionObject.category = ArtefactDataManager.CATEGORY_PRODUCTION;
				this._artefactsSelectionObject.isFavourite = false;
				
				hasSelectionChanged = true;
			}
			this.closeFilterMenu();
			break;
		case "dockMyArchiveButton":
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_MY_ARCHIVE){
				$("#dockHomeButton").css("background-color",this._buttonBackOffCSS)
				$("#dockYearButton").css("background-color",this._buttonBackOffCSS);
				$("#dockProductionButton").css("background-color",this._buttonBackOffCSS);
				$("#dockMyArchiveButton").css("background-color",this._buttonBackOnCSS);
				this._artefactsSelectionObject.isFavourite = true;
				this._artefactsSelectionObject.category = ArtefactDataManager.CATEGORY_MY_ARCHIVE;
				hasSelectionChanged = true;
			}
			this.closeFilterMenu();
			break;
		case "dockInfoButton":
			this.dispatchEvent(new DockViewControllerEvent(DockViewControllerEvent.INFO_OPEN));
			this.closeFilterMenu();
			break;
		case "dockShowFiltersButton":
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_NONE)return;
			if(this._isFilterMenuOpen === false){
				this.openFilterMenu();
			}else{
				this.closeFilterMenu();
			}
			break;
		case "filterPhotosButton":
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_NONE)return;
			if(this._artefactsSelectionObject.filters.length > 0){
				if(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_PHOTO) === -1){
					this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_PHOTO);
				}else{
					this._artefactsSelectionObject.filters.splice(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_PHOTO),1);
				}
			}else{
				//all else are selected
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_POSTERS);
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_VIDEO);
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_AUDIO);
			}
			this.updateFilterMenu();
			hasSelectionChanged = true;
			break;
		case "filterPostersButton":
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_NONE)return;
			if(this._artefactsSelectionObject.filters.length > 0){
				if(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_POSTERS) === -1){
					this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_POSTERS);
				}else{
					this._artefactsSelectionObject.filters.splice(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_POSTERS),1);
				}
			}else{
				//all else are selected
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_PHOTO);
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_VIDEO);
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_AUDIO);
			}
			this.updateFilterMenu();
			hasSelectionChanged = true;
			break;
		case "filterVideoButton":
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_NONE)return;
			if(this._artefactsSelectionObject.filters.length > 0){
				if(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_VIDEO) === -1){
					this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_VIDEO);
				}else{
					this._artefactsSelectionObject.filters.splice(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_VIDEO),1);
				}
			}else{
				//all else are selected
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_POSTERS);
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_PHOTO);
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_AUDIO);
			}
			this.updateFilterMenu();
			hasSelectionChanged = true;
			break;
		case "filterAudioButton":
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_NONE)return;
			if(this._artefactsSelectionObject.filters.length > 0){
				if(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_AUDIO) === -1){
					this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_AUDIO);
				}else{
					this._artefactsSelectionObject.filters.splice(this._artefactsSelectionObject.filters.indexOf(ArtefactDataManager.FILTER_AUDIO),1);
				}
			}else{
				//all else are selected
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_POSTERS);
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_VIDEO);
				this._artefactsSelectionObject.filters.push(ArtefactDataManager.FILTER_PHOTO);
			}
			this.updateFilterMenu();
			hasSelectionChanged = true;
			break;
		case "filterClearButton":
			if(this._artefactsSelectionObject.length !== 0){
				$('#filterPhotosButton').attr('class','checkBoxSelected');
				$('#filterPostersButton').attr('class','checkBoxSelected');
				$('#filterVideoButton').attr('class','checkBoxSelected');
				$('#filterAudioButton').attr('class','checkBoxSelected');
				this._artefactsSelectionObject.filters = [];
				hasSelectionChanged = true
			}
			break;
		case "dockSearchButton":
			//var searchField = $("#dockSearchField");
			//var searchString = searchField.val();
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_NONE)return;
			var searchString = document.getElementById("dockSearchField").value;
			
			if(searchString !== ""){
				this._artefactsSelectionObject.keywordsArray = searchString.split(" ");
				
			}else{
				this._artefactsSelectionObject.keywordsArray = [];
			}
			this.closeFilterMenu();
			hasSelectionChanged = true;
			break;
		case "dockSearchResetButton":
			//var searchField = $("#dockSearchField");
			//var searchString = searchField.val();
			if(this._artefactsSelectionObject.category !== ArtefactDataManager.CATEGORY_NONE)return;
			var searchString = document.getElementById("dockSearchField").value;
			
			
			if(this._artefactsSelectionObject.keywordsArray.length !== 0){
				this._artefactsSelectionObject.keywordsArray = [];
				hasSelectionChanged = true;
			}
			if(searchString !== ""){
				document.getElementById("dockSearchField").value = "";	
			}
			this.closeFilterMenu();
			break;
	}
	
	//force updating dock state, needs to be refactered
	this.onSetSelectionObject(this._artefactsSelectionObject);
	
	if(hasSelectionChanged===true){
		this.dispatchEvent(new DockViewControllerEvent(DockViewControllerEvent.CHANGE_SELECTION,this._artefactsSelectionObject));
	}
	
};

DockViewController.prototype.submitSearch = function(){
	var searchString = document.getElementById("dockSearchField").value;
	//searchString = searchString.toLowerCase();
	document.getElementById("dockSearchField").value = searchString;	
	if(searchString !== ""){
		this._artefactsSelectionObject.keywordsArray = searchString.split(" ");
		
	}else{
		this._artefactsSelectionObject.keywordsArray = [];
	}
	this.dispatchEvent(new DockViewControllerEvent(DockViewControllerEvent.CHANGE_SELECTION,this._artefactsSelectionObject));
	if(Globals.os === Globals.OS_IOS){
		//window.blur();		//should close keyboard
		//document.getElementById("dockSearchField").blur();
	}
	document.getElementById("dockSearchField").blur();
	return false;
};

DockViewController.prototype.resetSearch = function(){
	var searchString = document.getElementById("dockSearchField").value;
	if(this._artefactsSelectionObject.keywordsArray.length !== 0){
		this._artefactsSelectionObject.keywordsArray = [];
		hasSelectionChanged = true;
	}else if(searchString !== ""){
		document.getElementById("dockSearchField").value = "";
	}
	this.dispatchEvent(new DockViewControllerEvent(DockViewControllerEvent.CHANGE_SELECTION,this._artefactsSelectionObject));
};






DockViewController.prototype.onSetSelectionObject = function(selectionObject){
	if(selectionObject.category === ArtefactDataManager.CATEGORY_NONE){
		$("#dockHomeButton").css("background-color",this._buttonBackOnCSS)
		$("#dockYearButton").css("background-color",this._buttonBackOffCSS);
		$("#dockProductionButton").css("background-color",this._buttonBackOffCSS);
		$("#dockMyArchiveButton").css("background-color",this._buttonBackOffCSS);
	}else if(selectionObject.category === ArtefactDataManager.CATEGORY_YEAR){
		$("#dockHomeButton").css("background-color",this._buttonBackOffCSS)
		$("#dockYearButton").css("background-color",this._buttonBackOnCSS);
		$("#dockProductionButton").css("background-color",this._buttonBackOffCSS);
		$("#dockMyArchiveButton").css("background-color",this._buttonBackOffCSS);
	}else if(selectionObject.category === ArtefactDataManager.CATEGORY_PRODUCTION){
		$("#dockHomeButton").css("background-color",this._buttonBackOffCSS)
		$("#dockYearButton").css("background-color",this._buttonBackOffCSS);
		$("#dockProductionButton").css("background-color",this._buttonBackOnCSS);
		$("#dockMyArchiveButton").css("background-color",this._buttonBackOffCSS);
	}else{
		$("#dockHomeButton").css("background-color",this._buttonBackOffCSS)
		$("#dockYearButton").css("background-color",this._buttonBackOffCSS);
		$("#dockProductionButton").css("background-color",this._buttonBackOffCSS);
		$("#dockMyArchiveButton").css("background-color",this._buttonBackOnCSS);
	}
	/*
	if(selectionObject.isFavourite === true){
		$("#dockMyArchiveButton").css("background-color",this._buttonBackOnCSS);
	}else{
		$("#dockMyArchiveButton").css("background-color",this._buttonBackOffCSS);
	}
	*/
	/*
	if(selectionObject.filters.indexOf(ArtefactDataManager.FILTER_PHOTO) !== -1){
		//$("#dockPhotosButton").css("background-color",this._buttonBackOnCSS);
		$('#filterPhotosButton').attr('class','checkBoxSelected');
	}else{
		//$("#dockPhotosButton").css("background-color",this._buttonBackOffCSS);
		$('#filterPhotosButton').attr('class','checkBoxUnSelected');
	}
	
	if(selectionObject.filters.indexOf(ArtefactDataManager.FILTER_POSTERS) !== -1){
		//$("#dockPostersButton").css("background-color",this._buttonBackOnCSS);
		$('#filterPostersButton').attr('class','checkBoxSelected');
	}else{
		//$("#dockPostersButton").css("background-color",this._buttonBackOffCSS);
		$('#filterPostersButton').attr('class','checkBoxUnSelected');
	}
	
	if(selectionObject.filters.indexOf(ArtefactDataManager.FILTER_VIDEO) !== -1){
		//$("#dockVideoButton").css("background-color",this._buttonBackOnCSS);
		$('#filterVideoButton').attr('class','checkBoxSelected');
	}else{
		//$("#dockVideoButton").css("background-color",this._buttonBackOffCSS);
		$('#filterVideoButton').attr('class','checkBoxUnSelected');
	}
	
	if(selectionObject.filters.indexOf(ArtefactDataManager.FILTER_AUDIO) !== -1){
		//$("#dockAudioButton").css("background-color",this._buttonBackOnCSS);
		$('#filterAudioButton').attr('class','checkBoxSelected');
	}else{
		//$("#dockAudioButton").css("background-color",this._buttonBackOffCSS);
		$('#filterAudioButton').attr('class','checkBoxUnSelected');
	}
	*/
	
	
	var searchField = document.getElementById("dockSearchField");
	if(selectionObject.keywordsArray.length === 0){
		searchField.value = "";
	}else{
		searchField.value = selectionObject.keywordsArray.join(" ");
	}
	
	this._artefactsSelectionObject = selectionObject.clone();
	this.updateFilterMenu();
};



//PUBLIC
//_________________________________________________________________________________________
DockViewController.prototype.activate = function(){
	$("#dockContainer").css("opacity",1);
	/*
	
	var buttonArray = $("#dockContainer a").get();
	for(var i=0;i<buttonArray.length;i++){
		addEvent(buttonArray[i],"click",this.onDockButtonMouseUpHandler.rEvtContext(this));
	}
	*/
	console.log('dock activate');
	$("#dockContainer a").bind("click",this.onDockButtonMouseUpHandler.rEvtContext(this));
	$("#dockForm").bind("submit",this.submitSearch.rEvtContext(this));
	$("#dockSubMenu .closeButton").bind('click',this.closeFilterMenu.rEvtContext(this));
	//$("#dockContainer a").tap(function(){});
	//$("#dockContainer a").bind("touchbegin",this.onDockButtonMouseUpHandler.rEvtContext(this));
	//
};

DockViewController.prototype.deactivate = function(){
	console.log('dock deactivate');
	$("#dockContainer").css("opacity",0.5);
	$("#dockContainer a").unbind('click');
	$("#dockForm").unbind("submit");
	$("#dockSubMenu .closeButton").unbind('click');
	//removeEvent();
	/*
	var buttonArray = $("#dockContainer a").get();
	for(var i=0;i<buttonArray.length;i++){
		removeEvent(buttonArray[i],"click",this.onDockButtonMouseUpHandler.rEvtContext(this));
	}
	*/
};

DockViewController.prototype.setSelectionObject = function(selectionObject){
	this.onSetSelectionObject(selectionObject);
};

DockViewController.prototype.setKeywordAndSubmit = function(str){
	$("#dockSearchField")[0].value = str;
	this.submitSearch();
};







//Event Classes
//_________________________________________________________________________________________	
var DockViewControllerEvent = function(eventType,selectionObject){
	this.eventType = eventType;
	this.selectionObject = selectionObject;
};
DockViewControllerEvent.CHANGE_SELECTION = "changeSelection";
DockViewControllerEvent.INFO_OPEN = "infoOpen";