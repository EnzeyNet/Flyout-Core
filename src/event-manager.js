var Helpers = require('./helpers/helpers');

var register = function(fn, debounceTime, maxWait) {
	var eventData = eventMap.get(fn);
	if (!eventData) {
		eventData = {
			registerdTime: Date.now()
		}
		eventMap.set(fn, eventData);
	}

}

var elemToFlyout = new WeakMap();
var containersToFlyout = new WeakMap();

var flyoutToElem = new WeakMap();
var flyoutToContainers = new WeakMap();


var flyouts = new Set();

var getRoots = function(map) {
	var roots = [];

	var allParents = new Set();
	var allChildren = new Set();

	map.forEach(function(childSet, parentObj) {
		allParents.add(parentObj);
		childSet.forEach(allChildren.add.bind(allChildren));
	});
	allParents.forEach(function(parentObj) {
		if (!allChildren.has(parentObj)) {
			roots.push( parentObj );
		}
	});

	return roots;
};

var foouts = new Set();
var containerToFlyout = new WeakMap();
var elemToFlyout = new WeakMap();
var flyoutParentToChildren = new Map();

var register = function(flyout) {
	foouts.add(flyout);
	containerToFlyout.set(flyout.flyoutContainer, flyout);
	elemToFlyout.set(flyout.flyoutElem, flyout);

	var windowHtml = window.document.children[0];
	var domElem = flyout.flyoutElem;
	while (domElem) {
		var parentFlyout = containerToFlyout.get(domElem);
		if (parentFlyout) {
			var children = flyoutParentToChildren.get(parentFlyout);
			if (!children) {
				children = new Set();
				flyoutParentToChildren.set(parentFlyout, children);
			}
			children.add(flyout);
			break;
		}
		var domParent = domElem.parentElement;
		if (!domParent && domElem !== windowHtml) {
			// This Flyout is no longer in the DOM
			foouts.delete(flyout);
		} else {
			flyoutParentToChildren.set(flyout, new Set());
		}
		domElem = domParent;
	}
}

var registerFlyout = function(flyout) {
	flyouts.add(flyout)
};

var getParentToChildren = function() {
	var containerToFlyout = new Map();
	var elemToFlyout = new Map();

	flyouts.forEach(function(flyout) {
		if (flyout.isActive()) {
			if (flyout.flyoutContainer) {
				containerToFlyout.set(flyout.flyoutContainer, flyout);
			}
			if (flyout.flyoutElem) {
				elemToFlyout.set(flyout.flyoutElem, flyout);
			}
		}
	});

	var windowHtml = window.document.children[0];
	var flyoutParentToChildren = new Map();
	flyouts.forEach(function(flyout) {
		var domElem = flyout.flyoutElem;
		while (domElem) {
			var parentFlyout = containerToFlyout.get(domElem);
			if (parentFlyout) {
				var children = flyoutParentToChildren.get(parentFlyout);
				if (!children) {
					children = new Set();
					flyoutParentToChildren.set(parentFlyout, children);
				}
				children.add(flyout);
				break;
			}
			var domParent = domElem.parentElement;
			if (!domParent && domElem !== windowHtml) {
				// This Flyout is no longer in the DOM
				flyouts.delete(flyout);
			} else {
				flyoutParentToChildren.set(flyout, new Set());
			}
			domElem = domParent;
		}
	});

	return flyoutParentToChildren;
};

var isFlyoutStillActive = function(flyout, parentToChildren, eventInfo) {
	// Check if this flyout has Children and process
	//    them for Leaf first recurrsion.
	var children = parentToChildren.get(flyout);
	var isActive = false;
	if (children) {
		children.forEach(function(childFlyout) {
			// Once TRUE stay true.
			// Ensures the parent stats active since at least one child is still active.
			isActive = isFlyoutStillActive(childFlyout, parentToChildren, eventInfo) || isActive;
		});
	}

	if (!isActive) {
		flyout.processEvent(eventInfo);
		isActive = flyout.isActive();
	}

	return isActive;
}
/*
var processFlyoutEvent = function(e) {
	var parentToChildren = getParentToChildren();
	var rootFlyouts = getRoots(parentToChildren);
	rootFlyouts.forEach(function(flyout) {
		isFlyoutStillActive(flyout, parentToChildren, e);
	});
}
*/

var processFlyoutEvent = function(e) {
	var rootFlyouts = getRoots(flyoutParentToChildren);
	rootFlyouts.forEach(function(flyout) {
		isFlyoutStillActive(flyout, flyoutParentToChildren, e);
	});
};

var eventMouseMove = function(event) {
	processFlyoutEvent({
		x: event.x,
		y: event.y,
		type: 'hover',
	});
};
window.document.addEventListener('mousemove', Helpers.throttle(eventMouseMove, 100));

var eventMouseClick = function(event) {
	processFlyoutEvent({
		x: event.x,
		y: event.y,
		type: 'click',
	});
};
window.document.addEventListener('click', Helpers.throttle(eventMouseClick, 20));

module.exports = {
	register: register,
	registerFlyout: registerFlyout
};