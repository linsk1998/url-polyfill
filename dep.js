
String.prototype.startsWith=function(str){
	if(this.indexOf(str)==0){return true;}
	return false;
};

if(!Object.defineProperties && Object.prototype.__defineSetter__){
	Object.defineProperties=function(obj,properties){
		for(var key in properties){
			var descriptor=properties[key];
			if(descriptor.get) obj.__defineGetter__(key,descriptor.get);
			if(descriptor.set) obj.__defineSetter__(key,descriptor.set);
		}
	};
}