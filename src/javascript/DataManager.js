var DataManager = function(){
	//Inheritance
	EventDispatcher.call(this);
	this.self = this;
	
	this._autoCompleteKeywordArray = [];
	this._autoCompleteKeywordHash = {};
	
};
//Inheritance
DataManager.prototype = new EventDispatcher();




//PRIVATE
//______________________________________________________________________
DataManager.prototype.tryToAddKeyword = function(str){
	if(this._autoCompleteKeywordHash[str]===undefined){
		this._autoCompleteKeywordArray.push(str);
		this._autoCompleteKeywordHash[str] = this._autoCompleteKeywordArray.length-1;
	}
};

DataManager.prototype.groomString = function(str){
	var a = str.split(" ");
	var d = a.length;
	while(d--)this.tryToAddKeyword(a[d]);
};



//PUBLIc
//______________________________________________________________________
DataManager.prototype.gleenKeywords = function(){
	console.log('DataManager gleenKeywords');
	this._autoCompleteKeywordArray = [];
	this._autoCompleteKeywordHash = {};
	
	var jsonData = Globals.artefactDataManager.getFeed();
	
	var decrement = jsonData.length;
	var o;
	while(decrement--){
		o = jsonData[decrement];
		//this.groomString(o.p);	//cut strings into separate words
		this.tryToAddKeyword(o.p);	//add whole production title
	}
	this._autoCompleteKeywordArray.sort();
};

DataManager.prototype.getAutoCompleteKeywordArray = function(){
	return this._autoCompleteKeywordArray;
};