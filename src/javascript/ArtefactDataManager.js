var ArtefactDataManager = function(){
	//Inheritance
	EventDispatcher.call(this);
	this.self = this;
	
	//Constants enums
	this.DATA_ORDER_CHRONOS = 0;
	this.DATA_ORDER_RANDOM = 1;
	
	//Properties
	this._dataArray;
	this._dataRandomArray;
	this._duplicatedArray;
	this._yearCategorisedArray;
	this._yearCategorisedMetaDataArray;
	this._productionCategorisedArray;
	this._productionCategorisedMetaDataArray;
	
	this._hasResults = false;
	this._currentFeed;
	this._isSearching;
	this._selectionObject;
	
	//temp variable to check speed
	this._lastTime;
	this._timeout;
};
//Inheritance
ArtefactDataManager.prototype = new EventDispatcher();

//Static Constants
ArtefactDataManager.CATEGORY_NONE = 0;
ArtefactDataManager.CATEGORY_PRODUCTION = 1;
ArtefactDataManager.CATEGORY_YEAR = 2;
ArtefactDataManager.CATEGORY_MY_ARCHIVE = 3;
ArtefactDataManager.FILTER_AUDIO = 3;
ArtefactDataManager.FILTER_PHOTO = 0;
ArtefactDataManager.FILTER_POSTERS = 1;
ArtefactDataManager.FILTER_VIDEO = 2;

ArtefactDataManager.prototype.onSuccess = function(e){
	var time =  new Date().getTime()  - this._lastTime
	Globals.log("ArtefactDataManager json complete:"+ time);
	this._dataArray = e;
	
	if(Globals.localStorageManager.hasHTML5LocalStorage() === true){
		this.mergeLocalStorageFavouritesWithData();	
	}
	
	
	
	this._dataRandomArray = [];
	this.randomiseArray(this._dataArray, this._dataRandomArray);
	
	var categoryDecrement;
	
	this._lastTime = new Date().getTime();
	this._yearCategorisedArray = [];
	this.categoriseByYear(this._dataArray, this._yearCategorisedArray);
	time =  new Date().getTime()  - this._lastTime
	Globals.log("ArtefactDataManager categoriseByYear complete:"+ time);
	
	//Create Category MetaData
	categoryDecrement = this._yearCategorisedArray.length;
	this._yearCategorisedMetaDataArray = [];
	var title;
	while(categoryDecrement--){
		//title = this.wrapTitle(this._yearCategorisedArray[categoryDecrement][0].d / 10000 >> 0);
		title = this._yearCategorisedArray[categoryDecrement][0].d / 10000 >> 0;
		this._yearCategorisedMetaDataArray.unshift({html:title});
	}
	
	
	this._lastTime = new Date().getTime();
	this._productionCategorisedArray = [];
	this.categoriseByProduction(this._dataArray, this._productionCategorisedArray);
	time =  new Date().getTime()  - this._lastTime
	Globals.log("ArtefactDataManager categoriseByProduction complete:"+ time);

	//Create Category MetaData
	categoryDecrement = this._productionCategorisedArray.length;
	this._productionCategorisedMetaDataArray = [];
	var title;
	while(categoryDecrement--){
		//title = this.wrapTitle(this._productionCategorisedArray[categoryDecrement][0].p);	//check to force wrap all titles 
		title = this._productionCategorisedArray[categoryDecrement][0].p;	//check to force wrap all titles 
		this._productionCategorisedMetaDataArray.unshift({html:title.toUpperCase()});
	}
	
	
	
	/*
	this._lastTime = new Date().getTime();
	this._duplicatedArray = [];
	this.duplicateArray(this._dataArray,this._duplicatedArray);
	time =  new Date().getTime()  - this._lastTime
	console.log("duplicateArray complete:"+ time);
	
	
	
	this._lastTime = new Date().getTime();
	this._duplicatedArray = [];
	this.filterArrayForMediaType(this._dataArray,this._duplicatedArray,3);
	time =  new Date().getTime()  - this._lastTime
	console.log("duplication complete:"+ time);
	
	this._lastTime = new Date().getTime();
	this._duplicatedArray = [];
	this.filterArrayForMediaType(this._dataArray,this._duplicatedArray,0);
	time =  new Date().getTime()  - this._lastTime
	console.log("filterArrayForMediaType complete:"+ time);
	
	*/
	/*
	this._lastTime = new Date().getTime();
	this._duplicatedArray = [];
	this.searchArrayForKeywordMatch(this._dataArray,this._duplicatedArray,"incididunt");
	time =  new Date().getTime()  - this._lastTime
	console.log("searchArrayForKeywordMatch complete:"+ time);
	*/
	this.dispatchEvent(new ArtefactDataManagerEvent("dataLoadComplete"));
};

ArtefactDataManager.prototype.wrapTitle = function (title){
	var wrapCharLimit = 43;
	var charDecriment = title.length;
	var remainingText = title;
	if(remainingText.length >= wrapCharLimit){
		var lineArray = [];
		var numberOfLines = Math.ceil(title.length / wrapCharLimit);
		while(remainingText.length >= wrapCharLimit){
			remainingText = this.extractLine(remainingText,lineArray,wrapCharLimit);
		}
		lineArray.push(remainingText);
		title = "";
		for(var i=0;i<lineArray.length;i++){
			title += "<span>" + lineArray[i] + "</span>";
		}
		return title;
	}
	return  "<span>" + title + "</span>";
}



ArtefactDataManager.prototype.extractLine = function(remainingText,lineArray,wrapCharLimit){
	var charDecrement = wrapCharLimit;
	while(charDecrement--){
		if(remainingText.charAt(charDecrement)===" "){
			lineArray.push(remainingText.substring(0,charDecrement));
			remainingText = remainingText.substr(charDecrement+1);
			return remainingText;
		}
	}
	return remainingText;
}


ArtefactDataManager.prototype.preWrapTitle = function(title){
	var wrapCharLimit = 50;
	var charDecriment = title.length;
	if(title.length >= wrapCharLimit){
		var lineArray = [];
		var numberOfLines = Math.ceil(title.length / wrapCharLimit);
		while(charDecriment--){
				
		}
	}
	
	
	return title;
}

//40 milliseconds ipad 1
ArtefactDataManager.prototype.duplicateArray = function(source,destination){
	var i=0;
	var l = source.length;
	var o;
	//destination = [];
	for(i=0;i<l;i++){
		destination[i] = this.copyDataObject(source[i]);
	}
}

//? milliseconds ipad 1, 0 on iMac
ArtefactDataManager.prototype.duplicateCategoryArray = function(source,destination){
	var startTime = new Date().getTime();
	var c = source.length;
	var l;
	while(c--){
		destination[c] = [];
		l = source[c].length;
		while(l--){
			destination[c][l] = this.copyDataObject(source[c][l]);
		}
	}
	Globals.log("ArtefactDataManager duplicateCategoryArray complete:"+  (new Date().getTime()  - startTime));
}
/*
//959 on iPad 1
ArtefactDataManager.prototype.randomiseArray = function(source,destination){
	var tempArray = [];
	this.duplicateArray(source,tempArray);
	var i=0;
	var l = source.length;
	var randomItem;
	for(i=l-1;i>-1;i--){
			randomIndex = Math.floor(Math.random()*tempArray.length);
			destination.push(this.copyDataObject(source[randomIndex]));
			tempArray.splice(randomIndex,1);
	}
}
*/
//80 on iPad 1
ArtefactDataManager.prototype.randomiseArray = function(source,destination){
	this.duplicateArray(source,destination)
	destination.sort(function() {return 0.5 - Math.random()})
}


// < 30 iPad1
ArtefactDataManager.prototype.filterArrayForMediaType = function(source,destination,mediaType){
	var i;
	var l = source.length;
	//destination = [];
	for(i=0;i<l;i = i +1){
		if(source[i].m === mediaType){
			destination.push(this.copyDataObject(source[i]));
		}
	}
}


ArtefactDataManager.prototype.filterDataForFavourites = function(source,destination){
	var sourceDecrement = source.length;
	while (sourceDecrement--) {
		if(source[sourceDecrement].f === 1){
			destination.unshift(this.copyDataObject(source[sourceDecrement]));
		}
	}
};

// < ? iPad1
ArtefactDataManager.prototype.filterDataForFilterType = function(source,destination,filterArray){
	/*
	var i;
	var l = source.length;
	//destination = [];
	for(i=0;i<l;i = i +1){
		if(source[i].m === mediaType){
			destination.push(this.copyDataObject(source[i]));
		}
	}
	*/
	var sourceDecrement = source.length;
	var sourceLength = source.length - 1;
	var sourceIncrement;
	var filterDecrement = filterArray.length;
	var filterLength = filterArray.length;
	//var hasResults = false;
	/*
	while (sourceDecrement--) {
	   	sourceIncrement =  sourceLength - sourceDecrement;
		filterDecrement = filterLength;
		while(filterDecrement--){
			if(source[sourceIncrement].m === filterArray[filterDecrement]){
				destination.push(this.copyDataObject(source[sourceIncrement]));
			}
		}
	}
	*/
	
	/*
	use unshift combinded with decrement to avoid "sourceLength - sourceDecrement";
	*/ 
	while (sourceDecrement--) {
		filterDecrement = filterLength;
		while(filterDecrement--){
			if(source[sourceDecrement].m === filterArray[filterDecrement]){
				destination.unshift(this.copyDataObject(source[sourceDecrement]));
				//hasResults = true;
			}
		}
	}
	
	//return hasResults;
}


// check against 1 property < 18
// check against 4 properties < 38
/*
ArtefactDataManager.prototype.searchArrayForKeywordMatch = function(source,destination,keyword){
	var i;
	var l = source.length;
	//destination = [];
	for(i=0;i<l;i = i +1){
		if(source[i].t.indexOf(keyword)!=-1 || source[i].p.indexOf(keyword)!=-1 || source[i].c.indexOf(keyword)!=-1 || source[i].a.indexOf(keyword)!=-1 ){
			destination.push(this.copyDataObject(source[i]));
		}
	}
}
*/
ArtefactDataManager.prototype.searchArrayForKeywordMatch = function(source,destination,keywordArray){
	/*
	var i;
	var l = source.length;
	//destination = [];
	
	for(i=0;i<l;i = i +1){
		if(source[i].t.indexOf(keyword)!=-1 || source[i].p.indexOf(keyword)!=-1 || source[i].c.indexOf(keyword)!=-1 || source[i].a.indexOf(keyword)!=-1 ){
			destination.push(this.copyDataObject(source[i]));
		}
	}
	*/
	var sourceDecrement = source.length;
	var sourceLength = source.length - 1;
	var sourceIncrement;
	var keywordDecrement = keywordArray.length;
	var keywordLength = keywordArray.length;
	var keywordsMatch = false;
	var lowerCaseKeywordArray = [];
	
	while(keywordDecrement--){
		lowerCaseKeywordArray.unshift(keywordArray[keywordDecrement].toLowerCase());
	}
	keywordDecrement = keywordArray.length;
	
	
	//var hasResults = false;
	
	while (sourceDecrement--) {				//interate through category array of artefacts
		keywordDecrement = keywordLength;
		keywordsMatch = false;
		while(keywordDecrement--){
			if(source[sourceDecrement].t.toLowerCase().indexOf(lowerCaseKeywordArray[keywordDecrement])!=-1 || source[sourceDecrement].p.toLowerCase().indexOf(lowerCaseKeywordArray[keywordDecrement])!=-1 || source[sourceDecrement].c.toLowerCase().indexOf(lowerCaseKeywordArray[keywordDecrement])!=-1 || source[sourceDecrement].a.toLowerCase().indexOf(lowerCaseKeywordArray[keywordDecrement])!=-1 ){
				keywordsMatch = true;
			}else{
				keywordsMatch = false;
				keywordDecrement = 0;
			}
		}
		if(keywordsMatch === true){
			//hasResults = true;
			destination.unshift(this.copyDataObject(source[sourceDecrement]));
		}
	}
	
	//return hasResults;
}




ArtefactDataManager.prototype.categoriseByYear = function(source,destination){
	var i;
	var l = source.length;
	var a = [];
	for(i=0;i<l;i = i +1){
		d = source[i].d / 10000 >> 0;
		if(a[d] === undefined){
			a[d] = [];
		}
		a[d].push(source[i]);
	}
	var i=0;
	for (var key in a){
		if(a[key].constructor === Array){
			destination[i] = a[key];
			i++;
		}
    }
}

ArtefactDataManager.prototype.categoriseByProduction = function(source,destination){
	var i;
	var l = source.length;
	var a = [];
	for(i=0;i<l;i = i +1){
		p = source[i].p;
		if(a[p] === undefined){
			a[p] = [];
		}
		a[p].push(source[i]);
	}
	var i=0;
	for (var key in a){
		if(a[key].constructor === Array){
			destination[i] = a[key];
			i++;
		}
    }
}


ArtefactDataManager.prototype.copyDataObject = function(s){
	//can't think why I copied the object, all data objects should refer back to original. We want all data to refered, maybe I was probably thinking about deleting the object for the feed, still, should be no need to duplicate the object.
	
	//return source and see what happens
	return s;
	/*
	var o = {};
	o.a = s.a;
	o.c = s.c;
	o.d = s.d;
	o.id = s.id;
	o.m = s.m;
	o.o = s.o;
	o.p = s.p;
	o.t = s.t;
	return o;
	*/
}

ArtefactDataManager.prototype.onComplete = function(e){
	Globals.log(e);
};

ArtefactDataManager.prototype.onError = function(e){
	Globals.log(e);
};

ArtefactDataManager.prototype.onSearchEnd = function(){
	this.dispatchEvent(new ArtefactDataManagerEvent(ArtefactDataManagerEvent.SEARCH_END));	
};

ArtefactDataManager.prototype.mergeLocalStorageFavouritesWithData = function(){
	var sourceDecrement = this._dataArray.length;
	while (sourceDecrement--) {	
		this._dataArray[sourceDecrement].f = Globals.localStorageManager.isArtefactSavedAsFavourite(this._dataArray[sourceDecrement]);
	}
};





//PUBLIC
//______________________________________________________________________________________________
ArtefactDataManager.prototype.load = function(){
	//Example {"a":"exercitation Excepteur dolor","id":1,"d":20040101,"c":"adipisicing voluptate","t":"elit, magna","o":1,"m":0,"p":"Grand Hotel – The Musical"}
	this._lastTime = new Date().getTime();
	//$.getJSON("data/data_full.json",this.onSuccess.context(this));
	$.getJSON("data/data_full.json",this.onSuccess.context(this));
	//$.getJSON("http://www.interactivelabs.co.uk/people/john/d/data_full.json",this.onSuccess.context(this));
};

/**
*@description method inititates a search and potential setting of a new feed, upon setting a new selection object, results are checked and not set if no results are returned
* TODO make more efficient and hopefully faster, also enable framebased interation
*/

ArtefactDataManager.prototype.setSelectionObject = function(selectionObject){
	this._lastTime = new Date().getTime();					//temp testing
	
	this._hasResults = true;								//we will have results provided no filters or keyword searches are used.
	var prospectiveFeed = [];
	var sourceDecrement;
	var destinationCategory;
	var tempDestination;
	
	//duplicate relavant feed, this allows modification without altering source, such as tileEngine adding dummy grid objects
	if(selectionObject.category === ArtefactDataManager.CATEGORY_PRODUCTION){	//Get correct source to work with
		this.duplicateCategoryArray(this._productionCategorisedArray,prospectiveFeed);	 
	}else if(selectionObject.category === ArtefactDataManager.CATEGORY_YEAR){
		//prospectiveFeed = this._yearCategorisedArray;
		this.duplicateCategoryArray(this._yearCategorisedArray,prospectiveFeed);
	}else{
		//prospectiveFeed = [this._dataRandomArray];		//force into an array so we can use same functions as on categories
		this.duplicateCategoryArray([this._dataRandomArray],prospectiveFeed);
	}
	
	//Filter for favorites
	sourceDecrement = prospectiveFeed.length;
	if(selectionObject.isFavourite === true){					//if we have filters then search for matches
		this._hasResults = false;								//reset results before we filter, if we have any then set back to true				
		tempDestination = [];
		while (sourceDecrement--) {
			destinationCategory = [];
			this.filterDataForFavourites(prospectiveFeed[sourceDecrement], destinationCategory);
			tempDestination.unshift(destinationCategory);
			if(destinationCategory.length > 0){				//check results length, if we have any turn on has results
				this._hasResults = true;
			}
		}
		prospectiveFeed = tempDestination;
	}
	
	//Filter for media filters
	sourceDecrement = prospectiveFeed.length;
	if(selectionObject.filters.length > 0){					//if we have filters then search for matches
		this._hasResults = false;							//reset results before we filter, if we have any then set back to true				
		tempDestination = [];
		while (sourceDecrement--) {
			destinationCategory = [];
			this.filterDataForFilterType(prospectiveFeed[sourceDecrement], destinationCategory, selectionObject.filters);
			tempDestination.unshift(destinationCategory);	//destinationCategory is added to tempDestination even if no results are found
			if(destinationCategory.length > 0){				//check results length, if we have any turn on has results
				this._hasResults = true;
			}
		}
		prospectiveFeed = tempDestination;
	}
	
	//filter for keyword
	sourceDecrement = prospectiveFeed.length;
	if(selectionObject.keywordsArray.length > 0){			//if we have keywords then search for matches
		this._hasResults = false;							//reset results before we search for keywords, if we have any then set back to true	
		tempDestination = [];
		while (sourceDecrement--) {
			destinationCategory = [];
			this.searchArrayForKeywordMatch(prospectiveFeed[sourceDecrement], destinationCategory, selectionObject.keywordsArray);
			if(destinationCategory.length > 0){				//check results length, if we have any turn on has results
				tempDestination.unshift(destinationCategory);
				this._hasResults = true;
			}
		}
		
		prospectiveFeed = tempDestination;
	}
	
	if(this._hasResults === true){							//only accept selectionObject if we have results
		this._selectionObject = selectionObject.clone();	//clone as selectionObject should be the DockViewControllers version
		this._currentFeed = prospectiveFeed;
	}

	time =  new Date().getTime()  - this._lastTime			//temp testing
	Globals.log("ArtefactDataManager search complete:"+ time);					//temp testing
	
	this._timeout = setTimeout(this.onSearchEnd.context(this),33);//breather
	
	return this._hasResults;
};

ArtefactDataManager.prototype.getSelectionObject = function(){
	return this._selectionObject;
};

/**
* getFeed called when selectionObject is updated from TapestryViewController
**/
ArtefactDataManager.prototype.getFeed = function(){
	if(this._selectionObject.category === ArtefactDataManager.CATEGORY_NONE || this._selectionObject.category === ArtefactDataManager.CATEGORY_MY_ARCHIVE){
		return this._currentFeed[0];
	}else{
		//return a copy as category view must modify data by shifting dummy cells into start
		
		
		return this._currentFeed;
	}
};

ArtefactDataManager.prototype.getHasResults = function(){
	return this._hasResults;
};

ArtefactDataManager.prototype.getRelatedArtefacts = function(data){
	var maxRelatedArtefacts = 10;
	var individuals = data.a.split(" ");
	var l = individuals.length;
	var randomIndex;
	var results = [];
	for(var i=0;i<maxRelatedArtefacts;i++){
		randomIndex = Math.floor(Math.random()*this._dataRandomArray.length);
		results.push(this._dataRandomArray[randomIndex]);
	}
	return results;
};

ArtefactDataManager.prototype.getCategoryArtefactMetaDataWithIndex = function(index){
	if(this._selectionObject.category === ArtefactDataManager.CATEGORY_PRODUCTION){
		return this._productionCategorisedMetaDataArray[index].html;
	}else{
		return this._yearCategorisedMetaDataArray[index].html;
	}
}

ArtefactDataManager.prototype.isArtefactIdValid = function(id){
	var decrement = this._dataArray.length;
	while(decrement--){
		if(this._dataArray[decrement].id === id){
			return true;
		}
	}
	return false;
}

ArtefactDataManager.prototype.getArtefactDataWithId = function(id){
	var decrement = this._dataArray.length;
	while(decrement--){
		if(this._dataArray[decrement].id === id){
			return this._dataArray[decrement];
		}
	}
	return false;
}


//Event Classes
//_________________________________________________________________________________________	
var ArtefactDataManagerEvent = function(eventType){
	this.eventType = eventType; 
};
ArtefactDataManagerEvent.SEARCH_START = "searchStart";
ArtefactDataManagerEvent.SEARCH_END = "searchEnd";



