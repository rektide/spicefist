var
  crypto= require("crypto"), 
  events= require("events"),
  fs= require("fs"),
  os= require("os"),
  util= require("util"),
  dbus= require("dbus-native"),
  Q= require("q")

var NAME= "/com/voodoowarez/Palette",
  NAME_SLASH= NAME+"/",
  INAME= NAME.replace("/","."),
  BUS

var faces= {
	palette: {
		name: INAME,
		property: {
			colors: "ai"
		},
		signals: {
			modified: ["ai", "colors"]
		}
	},
	introspectable: {
		name: "org.freedesktop.DBus.Introspectable",
		methods: {
			Introspect: ["","s"]
		}
	},
	peer: {
		name: "org.freedesktop.DBus.Peer",
		methods: {
			Ping: [],
			GetMachineId: ["","s"],
		}
		
	},
	properties: {
		name: "org.freedesktop.DBus.Properties",
		methods: {
			Get: ["ss", "v"],
			Set: ["ssv", ""],
			GetAll: ["s", "a{sv}"],
		},
		signals: {
			PropertiesChanged: ["s", "a{sv}", "as"]
		}
	}
}

function _instance(bus,colors){
	if(!(this instanceof _instance)){
		return new _instance(bus,colors)
	}

	if(bus instanceof Array){
		bus= null
		colors= bus
	}
	if(!bus){
		if(!BUS)
			BUS= dbus.sessionBus()
		bus= BUS
	}
	this.bus= bus
	this.colors= colors||[0x888F]

	// take a new name we have acquired and register all services
	function _acceptName(objName){
		this.names&&this.names.push(objName)|| this.names= [objName]
		//this.bus.setMethodCallHandler(objName, faces.introspectable.name, "Introspect", _introspect.bind(this))
		//this.bus.setMethodCallHandler(objName, faces.peer.name, "GetMachineId", _getMachineId.bind(this))
		//this.bus.setMethodCallHandler(objName, faces.peer.name, "Ping", _ping.bind(this))
		//this.bus.setMethodCallHandler(objName, faces.properties.name, "Get", _get.bind(this))
		//this.bus.setMethodCallHandler(objName, faces.properties.name, "GetAll", _getAll.bind(this))
		//this.bus.setMethodCallHandler(objName, faces.properties.name, "Set", _set.bind(this))
		for(var f in faces){
			this.bus.exportInterface(this, objName, faces[f])
		}
	}

	// attempt to get a name on the bus
	function _tryName(bus,name,now){
		return Q
		.ninvoke(bus, 'requestName', name, 0x3)
		.then(function(ok){
			if(ok == 1|| ok==4)
				return this.name
			if(ok == 2 && !this.now)
				return
			if(ok == 3 || this.now)
				throw {err:this.now?"queued":"blocked",for:"requestName",name:name}
		}.bind({name:name,now:now}))
	}

	// try to pull a name, then accept it if so.
	function _doName(name){
		return _tryName(this.bus,name,false).then(_acceptName.bind(this))
	}

	// find next available name
	function _nextName(bus){
		return Q
		.ninvoke(bus, 'ListNames')
		.then(function(names){
			var seen= []
			for(var n in names){
				var name= names[n]
				if(!name.startsWith(NAME_SLASH))
					continue
				var val= name.substring(NAME_SLASH.length)
				val= parseInt(val)||val
				seen.push(val)
			}
			seen= seen.sort()
			var saught= 1
			while(saught++ == seen[saught-1]) ;
			return saught
		})
	}

	_doName(this.bus,NAME,false)
	_nextName(this.bus).then(function(i){
		_doName(this.bus,NAME_SLASH+i,false)
	}.bind(this))
	this.bus.on("NameAcquired",_acceptName.bind(this))
}

function setColor(value){
	this.colors= value
	this.emit("PropertiesChanged", "com.voodoowarez.palette", [["colors",this.colors]], null)
	this.emit("modified", this.colors)
}

function Introspect(){
	return fs.readFileSync("palette.introspect","utf8")
}


function __calculateMachineId(){
	var shasum= crypto.createHash("sha1")
	shasum.update(os.hostname())
	shasum.update(os.type())
	shasum.update(os.platform())
	shasum.update(os.release())
	return shasum.digest("base64")
}

function _identity(){
	return this
}

function Ping(){
	return
}

function Get(iface, prop){
	if(iface == IFACE && prop == "colors")
		return this.colors
}

function GetAll(iface){
	if(iface == IFACE){
		return {"colors":colors}
	}
}

function Set(iface, prop, val){
	if(iface == IFACE && prop == "colors")
		this.setColor(val)
}

_instance.prototype.Introspect= Introspect
_instance.prototype.GetMachineId= _identity.bind(__calculateMachineId())
_instance.prototype.Ping= Ping
_instance.prototype.Get= Get
_instance.prototype.GetAll= GetAll
_instance.prototype.Set= Set
_instance.prototype.setColor = setColor
util.inherits(_instance, events.EventEmitter)

module.exports= _instance
module.exports.newPalette= _instance
