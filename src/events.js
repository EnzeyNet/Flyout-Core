var Helpers = require('./helpers/helpers');
var ConvexHull = require('./helpers/convexHull');
var EventManager = require('./event-manager');

var EventsBinder = function(flyout) {
	this.watchedElements = [];
	this._flyout = flyout;

	var that = this;
	for(var f in EventsBinder.prototype) {
		if ('function' === typeof EventsBinder.prototype[f]) {
			that[f] = EventsBinder.prototype[f].bind(that);
		}
	};
};

EventsBinder.prototype.watchMouseOver = function(event) {
	var flyout = this._flyout;

	flyout.unbindEvents();
	flyout.displayFlyout();
};

EventsBinder.prototype.clickEvent = function(event) {
	this._flyout.displayFlyout();
};

EventsBinder.prototype.processClickEvent = function(event) {
	if (event.type !== 'click') return;

	var flyout = this._flyout;

	if (!ConvexHull.isInsideElement(flyout.flyoutContainer, event) &&
		!ConvexHull.isInsideElement(flyout.flyoutElem.parentElement, event))
	{
		flyout.close();
	}
};

EventsBinder.prototype.registerScrollEvent = function(elem) {
	var flyout = this._flyout;

	var wrappedScrollEvent = function() {
		if (flyout.isActive()) {
			flyout.displayFlyout();
		} else {
			this.removeScrollEvents();
			elem.removeEventListener('scroll', wrappedScrollEvent);
		}
	};
	this.watchedElements.push({
		elem: elem,
		fn: wrappedScrollEvent
	});
	elem.addEventListener('scroll', wrappedScrollEvent);
};

EventsBinder.prototype.removeScrollEvents = function() {
	if (this.watchedElements) {
		this.watchedElements.forEach(function(group) {
			group.elem.removeEventListener('scroll', group.fn);
		});
	}
	this.watchedElements.length = 0;
};

module.exports = EventsBinder;
/*
module.exports = function(bindable) {
	var boundClones = {};
	Object.keys(events).forEach(function(key) {
		var fn = events[key];
		boundClones[key] = fn.bind(bindable)
	})

	return boundClones;
};

module.exports = events;
*/




EventsBinder.prototype.processMouseMove = function(event) {
	if (event.type !== 'hover') return;

	var flyout = this._flyout;

	var hull = ConvexHull.buildHull(flyout.flyoutElem.parentElement, flyout.flyoutContainer);
	if (!hull.isInsideElements(event)) {
		flyout.close();
		flyout.flyoutElem.parentElement.addEventListener('mouseover', this.watchMouseOver);

		return true;
	}
};


