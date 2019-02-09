/* global Module */

/* Magic Mirror
 * Module: MMM-BridgeBoard
 *
 * By Caolan McKendry (https://www.caolan.me/)
 * MIT Licensed.
 */

Module.register('MMM-BridgeBoard',{

	defaults: {
		welcomeMessage: true
	},

	login_user: function () {

    var self = this;

		MM.getModules().withClass(this.config.defaultClass).exceptWithClass(this.config.everyoneClass).enumerate(function(module) {
			module.hide(1000, function() {
				Log.log(module.name + ' is hidden.');
			}, {lockString: self.identifier});
		});

		MM.getModules().withClass(this.current_user).enumerate(function(module) {
			module.show(1000, function() {
				Log.log(module.name + ' is shown.');
			}, {lockString: self.identifier});
		});

		this.sendNotification("CURRENT_USER", this.current_user);
	},
	logout_user: function () {

    var self = this;

		MM.getModules().withClass(this.current_user).enumerate(function(module) {
			module.hide(1000, function() {
				Log.log(module.name + ' is hidden.');
			}, {lockString: self.identifier});
		});

		MM.getModules().withClass(this.config.defaultClass).exceptWithClass(this.config.everyoneClass).enumerate(function(module) {
			module.show(1000, function() {
				Log.log(module.name + ' is shown.');
			}, {lockString: self.identifier});
		});

		this.sendNotification("CURRENT_USER", "None");
	},

	// Override socket notification handler.
	socketNotificationReceived: function(notification, payload) {
		if (payload.action == "login"){
			if (this.current_user_id != payload.user){
				this.logout_user()
			}
			if (payload.user == -1){
				this.current_user = this.translate("stranger")
				this.current_user_id = payload.user;
			}
			else{
				this.current_user = this.config.users[payload.user];
				this.current_user_id = payload.user;
				this.login_user()
			}

			if (this.config.welcomeMessage) {
				this.sendNotification("SHOW_ALERT", {type: "notification", message: this.translate("message").replace("%person", this.current_user), title: this.translate("title")});
			}
		}
		else if (payload.action == "logout"){
			this.logout_user()
			this.current_user = null;
		}
	},

	notificationReceived: function(notification, payload, sender) {
		if (notification === 'DOM_OBJECTS_CREATED') {
      var self = this;
			MM.getModules().exceptWithClass("default").enumerate(function(module) {
				module.hide(1000, function() {
					Log.log('Module is hidden.');
				}, {lockString: self.identifier});
			});
		}
	},

	start: function() {
		this.current_user = null;
		this.sendSocketNotification('CONFIG', this.config);
		Log.info('Starting module: ' + this.name);
	}

});
