var URL;
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
			me.searchParams=new SearchParams(me);
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
			'	Public [search]',
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
			'End Class',
			'Function VBUrlFactory()',
			'	Dim o',
			'	Set o = New VBURL',
			'	Set VBUrlFactory = o',
			'End Function'
		].join('\n'), 'VBScript');
	}
})(this);