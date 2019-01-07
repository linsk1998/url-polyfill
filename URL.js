var URLSearchParams,URL;
if(!this.URLSearchParams){
	URLSearchParams=function(paramsString){
		this._data=new Array();
		if(paramsString){
			var i,pair;
			if(Array.isArray(paramsString)){
				i=this._data.length=paramsString.length;
				while(i-->0){
					pair=paramsString[i];
					this._data[i]=new Array(pairs[1],pairs[0]);
				}
			}else{
				var pairs=paramsString.split("&");
				i=this._data.length=pairs.length;
				while(i-->0){
					pair=pairs[i];
					var id=pair.indexOf("=");
					this._data[i]=new Array(pair.substring(id+1,pair.length),pair.substring(0,id));
				}
			}
		}
	};
	URLSearchParams.prototype.append=function(key,value){
		this._data.push([key,value]);
	};
	URLSearchParams.prototype.get=function(key){
		var item=this._data.find(function(item){
			return item[1]==key;
		});
		if(item) return item[0];
		return null;
	};
	URLSearchParams.prototype.getAll=function(key){
		return this._data.filter(function(item){
			return item[1]==key;
		}).map(function(item){
			return item[0];
		});
	};
	URLSearchParams.prototype.set=function(key,value){
		var item=this._data.find(function(item){
			return item[1]==key;
		});
		if(item){
			item[0]=value;
		}else{
			this.append(key,value);
		}
	};
	URLSearchParams.prototype['delete']=function(key){
		this._data=this._data.filter(function(item){
			return item[1]!=key;
		});
	};
	URLSearchParams.prototype.has=function(key){
		return this._data.some(function(item){
			return item[1]==key;
		});
	};
	URLSearchParams.prototype.toString=function(){
		return this._data.map(function(item){
			return encodeURIComponent(item[1])+"="+encodeURIComponent(item[0]);
		}).join("&");
	};
	URLSearchParams.prototype.sort=function(){
		return this._data.sort(function(a,b){
			return a[1] > b[1];
		});
	};
	URLSearchParams.prototype.forEach=function(fn,thisArg){
		this._data.forEach.apply(this._data,arguments);
	};
}
(function(window){
	var SearchParams=function(url){
		this._url=url;
	};
	SearchParams.prototype=Object.create(URLSearchParams.prototype);
	["append","set","delete"].forEach(function(method){
		SearchParams.prototype[method]=function(key,value){
			var searchParams=new URLSearchParams(this._url.search.replace(/^\?/,""));
			searchParams[method].apply(searchParams,arguments);
			this._url.search="?"+searchParams.toString();
		};
	});
	["getAll","get","has","toString"].forEach(function(method){
		SearchParams.prototype[method]=function(key,value){
			var searchParams=new URLSearchParams(this._url.search.replace(/^\?/,""));
			return searchParams[method].apply(searchParams,arguments);
		};
	});
	var url=null;
	try{
		url=new URL(location.href);
	}catch(e){
	}
	if(!url || !('href' in url)){
		URL=function(relativePath, absolutePath){
			var path,arr,me=this;
			if(!Object.defineProperties){
				me=VBUrlFactory();
			}
			me.protocol=me.hostname=me.pathname=null;
			me.port=me.search=me.hash=me.username=me.password="";
			var pattern=/^[a-zA-Z]+:/;
			if(arr=relativePath.match(pattern)){
				me.protocol=arr[0];
				path=relativePath.replace(pattern,"");
				pattern=/^\/*([^\/]+)/;
				var host=path.match(pattern)[1];
				path=path.replace(pattern,"");
				arr=host.split("@");
				if(arr.length>1){
					me.host=arr[1];
					arr=arr[0].split(":");
					if(arr.length>1){
						me.username=arr[0];
						me.password=arr[1];
					}else{
						me.username=arr[0];
					}
				}else{
					me.host=host;
				}
			}else if(absolutePath){
				var absInfo=absolutePath.indexOf?new URL(absolutePath):absolutePath;
				me.protocol=absInfo.protocol;
				me.hostname=absInfo.hostname;
				me.port=absInfo.port;
				if(absInfo.username) me.username=absInfo.username;
				if(absInfo.password) me.password=absInfo.password;
				me.pathname=absInfo.pathname;
				if(relativePath.startsWith("#")){
					me.search=absInfo.search;
					me.hash=relativePath;
					return me;
				}else if(relativePath.startsWith("?")){
					var a=relativePath.indexOf("#");
					if(a<0){
						me.search=relativePath;
						me.hash="";
					}else{
						me.search=relativePath.substr(0,a);
						me.hash=relativePath.substring(a,relativePath.length);
					}
					return me;
				}else if(relativePath.startsWith("/")){
					path=relativePath;
				}else if(relativePath.startsWith("../")){
					path=absInfo.pathname.replace(/\/[^\/]*$/,"/")+relativePath;
					pattern=/[^\/]+\/\.\.\//;
					while(pattern.test(path)){
						path=path.replace(pattern,"");
					}
					path=path.replace(/^(\/\.\.)+/,"");
				}else{
					path=absInfo.pathname.replace(/[^\/]*$/,"")+relativePath.replace(/^\.\//,"");
				}
			}else{alert(arr);
				throw "SYNTAX_ERROR";
			}
			pattern=/^[^#]*/;
			me.hash=path.replace(pattern,"");
			arr=path.match(pattern);
			path=arr[0];
			pattern=/^[^\?]*/;
			me.search=path.replace(pattern,"");
			arr=path.match(pattern);
			me.pathname=arr[0];
			return me;
		};
	}
	URL.properties={
		host:{
			enumerable:true,
			get:function(){
				if(this.port){
					return this.hostname+":"+this.port;
				}
				return this.hostname;
			},
			set:function(value){
				var pattern=/(.*):(\d+)$/;
				var arr=value.match(pattern);
				this.port="";
				if(arr){
					this.hostname=arr[1];
					this.port=arr[2];
				}else{
					this.hostname=value;
				}
			}
		},
		origin:{
			enumerable:true,
			get:function(){
				return this.protocol+"//"+this.host;
			}
		},
		href:{
			enumerable:true,
			get:function(){
				var user=this.username;
				if(user){
					if(this.password){
						user+=":"+this.password;
					}
					user+="@";
				}
				return this.protocol+"//"+user+this.host+this.pathname+this.search+this.hash;
			},
			set:function(value){
				var url=new URL(value);
				this.protocol=url.protocol;
				this.hostname=url.hostname;
				this.pathname=url.pathname;
				this.port=url.port;
				this.search=url.search;
				this.hash=url.hash;
				this.username=url.username;
				this.password=url.password;
			}
		},
		search:{
			enumerable:true,
			get:function(){
				if(this.searchParams){
					var search=this.searchParams.toString();
					if(search){
						return "?"+search;
					}
				}
				return "";
			},
			set:function(value){
				if(this.searchParams){
					var search=this.searchParams.toString();
					var keys=[];
					var pairs=search.split("&");
					var i=pairs.length;
					while(i-->0){
						var pair=pairs[i];
						var id=pair.indexOf("=");
						var key=pair.substring(0,id);
						this.searchParams['delete'](key);
					}
					search=value.replace(/^\?/,"");
					if(search){
						pairs=search.split("&");
						i=pairs.length;
						while(i-->0){
							var pair=pairs[i];
							var id=pair.indexOf("=");
							this.searchParams.append(pair.substring(id+1,pair.length),pair.substring(0,id));
						}
					}
				}else{
					this.searchParams=new URLSearchParams(value.replace(/^\?/,""));
				}
			}
		}
	};
	if(Object.defineProperties){
		if(!url || !('href' in url)){
			Object.defineProperties(URL.prototype,URL.properties);
		}else{
			if(!('origin' in url)){
				Object.defineProperty(URL.prototype,"origin",URL.properties.origin);
			}
			if(!('searchParams' in url)){
				Object.defineProperty(URL.prototype,"searchParams",{
					enumerable:true,
					get:function(){
						var searchParams=new SearchParams(this);
						Object.defineProperty(this,"searchParams",{
							enumerable:true,
							value:searchParams
						});
						return searchParams;
					}
				});
			}
		}
	}else{
		window.execScript([
			'Class VBURL',
			'	Public [protocol]',
			'	Public [hostname]',
			'	Public [pathname]',
			'	Public [port]',
			'	Public [searchParams]',
			'	Public [hash]',
			'	Public [username]',
			'	Public [password]',
			'	Public Property Let [host](var)',
			'		Call URL.properties.host.set.call(Me,var)',
			'	End Property',
			'	Public Property Get [host]',
			'		[host]=URL.properties.host.get.call(Me)',
			'	End Property',
			'	Public Property Let [origin](var)',
			'	End Property',
			'	Public Property Get [origin]',
			'		[origin]=URL.properties.origin.get.call(Me)',
			'	End Property',
			'	Public Property Let [href](var)',
			'		Call URL.properties.href.set.call(Me,var)',
			'	End Property',
			'	Public Property Get [href]',
			'		[href]=URL.properties.href.get.call(Me)',
			'	End Property',
			'	Public Property Let [search](var)',
			'		Call URL.properties.search.set.call(Me,var)',
			'	End Property',
			'	Public Property Get [search]',
			'		[search]=URL.properties.search.get.call(Me)',
			'	End Property',
			'End Class',
			'Function VBUrlFactory()',
			'	Dim o',
			'	Set o = New VBURL',
			'	Set VBUrlFactory = o',
			'End Function'
		].join('\n'), 'VBScript');
	}
})(this);