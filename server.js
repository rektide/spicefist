var dbus= require("dbus-native")
var session= dbus.sessionBus()

var paletteFace = {
	name: 'voodoowarez.pallete',
	signals: {
		modified: ['ai'],
		PropertiesChanged: ['s', 'a{sv}', 'as']
	},
	property: {
		colors: 'ai'
	}
}

