// JavaScript Document
var Rectangle = function(left,top,width,height){
	this.left = left || 0;
	this.top = top || 0;
	this.width = width || 0;
	this.height = height || 0;
}
Rectangle.prototype.contains = function(x,y){
	if(x >= this.left && x < this.left+this.width && y >= this.top && y < this.top+this.height){
		return true;
	}
	return false;
}
Rectangle.prototype.containsRect = function(x,y,w,h){
	if(x >= this.left && (x+w) <= this.left+this.width && y >= this.top && (y+h) <= this.top+this.height){
		return true;
	}
	return false;
}

Rectangle.prototype.union = function(toUnion){
	var union = new Rectangle();
	union.left = Math.min(this.left,toUnion.left);
	union.top = Math.min(this.top,toUnion.top);
	union.width = Math.max(this.left + this.width, toUnion.left + toUnion.width) - union.left;
	union.height = Math.max(this.top + this.height, toUnion.top + toUnion.height) - union.top;
	return union;
}

Rectangle.prototype.toString = function(){
	return "Rectangle left:"+this.left+" top:"+this.top+" width:"+this.width+" height:"+this.height;	
}

var Point = function(x,y){
	this.x = x;
	this.y = y;	
}

Point.distance = function(p1,p2){
	return Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2));
}
