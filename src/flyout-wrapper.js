var FlyoutComponent = require('./flyout');

var FlyoutWrapper = function () {
	
}

FlyoutWrapper.prototype.createdCallback = function() {
	this.Flyout = new FlyoutComponent(this)
}

FlyoutWrapper.prototype.attachedCallback = function() {
		this.Flyout.attachedCallback.apply(this.Flyout, arguments)
}

FlyoutWrapper.prototype.detachedCallback = function() {
		this.Flyout.detachedCallback.apply(this.Flyout, arguments)
}

FlyoutWrapper.prototype.attributeChangedCallback = function() {
		this.Flyout.attributeChangedCallback.apply(this.Flyout, arguments)
}

FlyoutWrapper.prototype.displayFlyout = function() {
		this.Flyout.displayFlyout()
}

module.exports = new FlyoutWrapper()