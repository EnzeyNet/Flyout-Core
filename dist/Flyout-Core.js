if (!EnzeyNet) {EnzeyNet = {};}

EnzeyNet.applyFunctions = function(someElem, someService) {
	for(var f in someService.prototype) {
		if ('function' === typeof someService.prototype[f]) {
			someElem[f] = someService.prototype[f];
		}
	};
};

EnzeyNet.FlyoutServices = function() {
	// expect Array.prototype.forEach
	// expect Array.prototype.map
};

(function(flyoutProto) {
	flyoutProto.getParentPositioning = function() {
		return {
			attributes: [
			],
			classes: [
				'flyout-against'
			]
		};
	};

	flyoutProto.findParentToPositionAgainst = function() {
		var thisElem = this;
		var positionAgainstElem;
		if (true) {
			// Get things to check for on parent.
			var parentIdentifiers = thisElem.getParentPositioning();
			if (parentIdentifiers.attributes) {
				var clone = parentIdentifiers.attributes.slice(0);
				clone.map(function(attr) {
					return 'data-' + attr;
				}).forEach(function(attr) {
					parentIdentifiers.attributes.push(attr);
				});
			}

			// Transverse DOM looking for element to position against.
			var searchParentElem = thisElem.parentElement;
			while (searchParentElem && !positionAgainstElem) {
				if (parentIdentifiers.classes instanceof Array) {
					parentIdentifiers.classes.forEach(function(someClass) {
						if (!positionAgainstElem) {
							if (searchParentElem.classList.contains(someClass)) {
								positionAgainstElem = searchParentElem;
							}
						}
					});
				}
				if (parentIdentifiers.attributes instanceof Array) {
					parentIdentifiers.attributes.forEach(function(someAttribute) {
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
			positionAgainstElem = thisElem.parentElement;
		}

		return positionAgainstElem;
	};

	flyoutProto.createdCallback = function() {
		var flyoutId = this.getAttribute('id');
		if (!flyoutId) {
			flyoutId = Date.now();
			this.setAttribute('id', flyoutId);
		}
		this.flyoutTempalte = this.innerHTML;
		console.log(this.flyoutTempalte);
		this.innerHTML = '';

		this.displayFlyout = this.displayFlyout.bind(this);
	};

	flyoutProto.attachedCallback = function() {
		this.flyoutParent = this.parentElement;
		if (this.flyoutParent.nodeName.toUpperCase() === 'BUTTON') {
			throw 'Parent of the flyout cannot be a button element.';
		}

		this.flyoutParent.setAttribute('flyout-id', this.getAttribute('id'));

		// Process element attributes
		this.attributeChangedCallback('flyout-on',  null, this.getAttribute('flyout-on'));
	};

	flyoutProto.detachedCallback = function() {
		this.flyoutParent.removeAttribute('flyout-id');
		console.log('detachedCallback');
		console.log(this.parentElement);
		console.log(this.flyoutParent);

		// Process element attributes
		this.attributeChangedCallback('flyout-on',  this.getAttribute('flyout-on'), null);
	};

	flyoutProto.attributeChangedCallback = function (name, oldValue, newValue) {
		if (name === 'flyout-on') {
			this.bindFlyoutAction(newValue, oldValue);
		}
	};

	flyoutProto.bindFlyoutAction = function(newValue, oldValue) {
		var flyoutElement = this;
		if (typeof oldValue === 'string') {
			oldValue = oldValue.split(' ');
			oldValue.forEach(function(oldVal) {
				flyoutElement.flyoutParent.removeEventListener(oldVal.trim(), flyoutElement.displayFlyout);
			});
		}

		if (typeof newValue === 'string') {
			newValue = newValue.split(' ');
			newValue.forEach(function(newVal) {
				flyoutElement.flyoutParent.addEventListener(newVal.trim(), flyoutElement.displayFlyout);
			});
		}
	};

	flyoutProto.displayFlyout = function(event) {
		var flyoutAlignedToElem = this.findParentToPositionAgainst();
		var flyoutElem = this;
		if (!flyoutElem.flyoutContainer) {
			flyoutElem.flyoutContainer = document.createElement('div');
			flyoutElem.flyoutContainer.innerHTML = flyoutElem.flyoutTempalte;

			EnzeyNet.Services.registerClickAwayAction(function(event) {
				flyoutElem.flyoutContainer.parentElement.removeChild(flyoutElem.flyoutContainer);
				flyoutElem.flyoutContainer = null;
			}, flyoutElem.flyoutContainer, flyoutElem.flyoutParent);

			var iframeShim = document.createElement('iframe');
			iframeShim.classList.add('shim');
			EnzeyNet.Services.prepend(flyoutElem.flyoutContainer, iframeShim);

			flyoutAlignedToElem.appendChild(flyoutElem.flyoutContainer);
		}
		this.positionFlyout(flyoutElem.flyoutContainer);
	}

	flyoutProto.positionFlyout = function(alignToElement) {
		var alignMyAttr = this.getAttribute('align-my');
		var alignToAttr = this.getAttribute('align-to');
		if (alignToAttr) {
			if (alignMyAttr) {
				var alignMyArray = alignMyAttr.split(' ');
				if (alignMyArray.length !== 2) {return;}

				var myVerticalPredicate   = alignMyArray[0];
				var myHorizontalPredicate = alignMyArray[1];

				var alignToArray = alignToAttr.split(' ');
				if (alignToArray.length !== 2) {return;}

				var itsVerticalPredicate   = alignToArray[0];
				var itsHorizontalPredicate = alignToArray[1];

				var alignToElementParent = alignToElement.parentElement;
				var alignToElementStyles = window.getComputedStyle(alignToElementParent);
				if (alignToElementStyles.position === 'static') {
					alignToElementParent.style.position = 'relative';
				}

				alignToElement.style.overflow = 'visible';
				alignToElement.style.position = 'absolute';
				alignToElement.style.transform = '';

				alignToElement.classList.add('flyout-align-my-' + myVerticalPredicate + '-' + myHorizontalPredicate + '-to-' + itsVerticalPredicate + '-' + itsHorizontalPredicate);

			}
		}
	};

})(EnzeyNet.FlyoutServices.prototype);