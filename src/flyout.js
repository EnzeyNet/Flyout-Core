var EventsBinder = require('./events');
var EventManager = require('./event-manager');
var Positioner = require('./position');

var getFlyoutPredicate = function(flyoutElem) {
	var alignMyAttr = flyoutElem.getAttribute('align-my');
	var alignToAttr = flyoutElem.getAttribute('align-to');

	return {
		flyout: alignMyAttr,
		anchor: alignToAttr,
	}
}

var Flyout = function(flyoutElem) {
	// expect Array.prototype.forEach
	// expect Array.prototype.map

	if (!flyoutElem || !flyoutElem.prototype instanceof HTMLElement) {
		throw 'flyoutElem must be an HTMLElement'
	}

	this.flyoutElem = flyoutElem;
	this.EVENTS = new EventsBinder(this);

	// Set id on element
	var flyoutId = flyoutElem.getAttribute('id');
	if (!flyoutId) {
		flyoutId = 'f' + Date.now();
		flyoutElem.setAttribute('id', flyoutId);
	}

	// Store inner HTML
	this.flyoutTempalte = flyoutElem.innerHTML;
	flyoutElem.innerHTML = '';

	this.displayFlyout = this.displayFlyout.bind(this);
	this.unbindEvents = this.unbindEvents.bind(this);
	this.close = this.close.bind(this);
	this.clearTimers = this.clearTimers.bind(this);
	this.isActive = this.isActive.bind(this);
	this.EVENTS = new EventsBinder(this);

	var flyoutElem = this;
	(function() {
		var flyoutParent = null;
		flyoutElem.setFlyoutParent = function(elem) {
			flyoutParent = elem;
		};
		flyoutElem.getFlyoutParent = function(elem) {
			return flyoutParent;
		};
	})();
	(function() {
		var flyoutChild = null;
		flyoutElem.setFlyoutChild = function(elem) {
			flyoutChild = elem;
		};
		flyoutElem.getFlyoutChild = function(elem) {
			return flyoutChild;
		};
	})();
};
var flyoutProto = Flyout.prototype;

flyoutProto.processEvent = function(event) {
	this.close();
	return false;
};

flyoutProto.getPositioningKeys = function() {
	return {
		attributes: [
		],
		classes: [
			'flyout-against'
		]
	};
};

flyoutProto.findParentToPositionAgainst = function() {
	var flyoutElem = this.flyoutElem;
	var positionAgainstElem;
	if (true) {
		// Get things to check for on parent.
		var positioningKeys = this.getPositioningKeys();
		if (positioningKeys.attributes) {
			var clone = positioningKeys.attributes.slice(0);
			clone.map(function(attr) {
				return 'data-' + attr;
			}).forEach(function(attr) {
				positioningKeys.attributes.push(attr);
			});
		}

		// Transverse DOM looking for element to position against.
		var searchParentElem = flyoutElem.parentElement;
		while (searchParentElem && !positionAgainstElem) {
			if (positioningKeys.classes instanceof Array) {
				positioningKeys.classes.forEach(function(someClass) {
					if (!positionAgainstElem) {
						if (searchParentElem.classList.contains(someClass)) {
							positionAgainstElem = searchParentElem;
						}
					}
				});
			}
			if (positioningKeys.attributes instanceof Array) {
				positioningKeys.attributes.forEach(function(someAttribute) {
					if (!positionAgainstElem) {
						if (searchParentElem.attributes[someAttribute]) {
							positionAgainstElem = searchParentElem;
						}
					}
				});
			}

			searchParentElem = searchParentElem.parentElement;
		}

	}
	if (!positionAgainstElem) {
		positionAgainstElem = flyoutElem.parentElement;
	}

	return positionAgainstElem;
};

flyoutProto.attachedCallback = function() {
	// Process element attributes
	this.attributeChangedCallback('flyout-on',  null, this.flyoutElem.getAttribute('flyout-on'));
	//EventManager.registerFlyout(this);
};

flyoutProto.detachedCallback = function() {
	// Process element attributes
	this.attributeChangedCallback('flyout-on',  this.flyoutElem.getAttribute('flyout-on'), null);
};

flyoutProto.attributeChangedCallback = function (name, oldValue, newValue) {
	if (name === 'flyout-on') {
		if (newValue) {
			this.bindFlyoutAction(newValue, oldValue);
		}
	}
};

flyoutProto.bindFlyoutAction = function(newValue, oldValue) {
	var flyout = this;

	var eventProcessors = [];
	this.unbindEvents();
	if (typeof newValue === 'string') {
		newValue = newValue.split(' ');
		console.log(newValue)
		if (newValue.indexOf('click') >= 0) {
			eventProcessors.push(flyout.EVENTS.processClickEvent);
			flyout.flyoutElem.parentElement.addEventListener('click', flyout.EVENTS.clickEvent);
		} else if (newValue.indexOf('hover') >= 0) {
			eventProcessors.push(flyout.EVENTS.processMouseMove);
			flyout.flyoutElem.parentElement.addEventListener('mouseover', flyout.EVENTS.watchMouseOver);
		}
	}
	flyout.processEvent = function(event) {
		eventProcessors.forEach(function(processor) {
			if (flyout.isActive()) {
				processor(event);
			}
		});
	}
};

flyoutProto.unbindEvents = function() {
	var flyoutElem = this.flyoutElem;

	flyoutElem.parentElement.removeEventListener('click', this.EVENTS.clickEvent);
	flyoutElem.parentElement.removeEventListener('mouseover', this.EVENTS.watchMouseOver);
};

flyoutProto.isActive = function() {
	return this.isActiveBool;
};

flyoutProto.clearTimers = function() {
	if (this.pendingRenderActions) {
		window.cancelAnimationFrame(this.pendingRenderActions.animationFrame);
		window.clearTimeout(this.pendingRenderActions.timeout);
	}
	this.pendingRenderActions = {};
};

flyoutProto.close = function() {
	var flyout = this;
	flyout.isActiveBool = false;

	flyout.flyoutContainer.addEventListener('transitionend', function() {
		//flyout.unlinkFlyouts();
		if (!flyout.isActive()) {
			flyout.clearTimers();
			if (flyout.changeObserver) {
				flyout.changeObserver.disconnect();
			}
			flyout.EVENTS.removeScrollEvents();
			flyout.flyoutContainer.parentElement.removeChild(flyout.flyoutContainer);
			flyout.flyoutContainer = null;
			flyout.flyoutAlignedToElem = null;
		}
	});

	flyout.pendingRenderActions.animationFrame = window.requestAnimationFrame(function() {
		flyout.flyoutContainer.classList.add('leave');

		flyout.pendingRenderActions.animationFrame = window.requestAnimationFrame(function() {
			flyout.flyoutContainer.classList.add('active');
		});
	});

};

flyoutProto.displayFlyout = function() {
	var flyout = this;
	var flyoutElem = this.flyoutElem;

	this.clearTimers();

	if (flyout.isActive()) {
		flyout.pendingRenderActions.animationFrame = Positioner.position(
			flyout.flyoutContainer,
			flyout.flyoutAlignedToElem,
			getFlyoutPredicate(flyout.flyoutElem)
		);
	} else {
		//this.linkFlyouts();
		flyout.flyoutAlignedToElem = flyout.findParentToPositionAgainst();

		if (!flyout.flyoutContainer) {
			flyout.flyoutContainer = document.createElement('div');
			
			flyout.flyoutContainer.style.position = 'fixed';
			flyout.flyoutContainer.style.top = '0';
			elemLeft = '0';
			flyout.flyoutContainer.style.visibility = 'hidden';

			if (window.MutationObserver) {
				flyout.changeObserver = new window.MutationObserver(
					function () {
						flyout.displayFlyout()
					}
				);
				// configuration of the observer:
				var config = { subtree: true, childList: true, characterData: true };
				flyout.changeObserver.observe(flyout.flyoutContainer, config)
			}

			flyout.flyoutContainer.innerHTML = flyout.flyoutTempalte;
			var flyoutId = flyoutElem.getAttribute('id');
			flyout.flyoutContainer.setAttribute('flyout-for', flyoutId);
		}

		flyout.pendingRenderActions.animationFrame = window.requestAnimationFrame(function() {

			flyout.flyoutContainer.classList.remove('leave');
			flyout.flyoutContainer.classList.remove('active');
			if (flyout.flyoutContainer.parentElement !== window.document.body) {
				window.document.body.appendChild(flyout.flyoutContainer);
				flyout.flyoutContainer.classList.add('enter');
			}

			flyout.pendingRenderActions.animationFrame = window.requestAnimationFrame(function() {
				flyout.flyoutContainer.classList.add('enter');
			});

			flyout.pendingRenderActions.timeout = setTimeout(function() {
				// Transverse DOM looking for element to position against.
				var searchParentElem = flyout.flyoutAlignedToElem.parentElement;
				while (searchParentElem) {
					flyout.EVENTS.registerScrollEvent(searchParentElem);
					searchParentElem = searchParentElem.parentElement;
				}
				flyout.EVENTS.registerScrollEvent(document);
				flyout.pendingRenderActions.animationFrame = Positioner.position(
					flyout.flyoutContainer,
					flyout.flyoutAlignedToElem,
					getFlyoutPredicate(flyout.flyoutElem)
				);
				EventManager.register(flyout);
				flyout.isActiveBool = true;
			}, 0);
		});
	}

}

module.exports = Flyout;