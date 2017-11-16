// Position to Anchor Element

var Helpers = require('./helpers/helpers');

var positioner = {};
/**
	@param alignMyAttr [string] String to parse to get anchor point for flyout element.
	@param alignToAttr [string] String to parse to get anchor point for anchor element.

	Extracts the text predicate used for positioning.

	@return {
		horizontal: {
			my: myHorizontalPredicate,
			its: itsHorizontalPredicate
		},
		vertical: {
			my: myVerticalPredicate,
			its: itsVerticalPredicate
		}
	}
**/
positioner.extractElemPostion = function(alignMyAttr, alignToAttr) {
	var result = null;
	if (alignMyAttr) {
		if (alignToAttr) {
			var alignMyArray = alignMyAttr.split(' ');
			if (alignMyArray.length !== 2) {return;}

			var myVerticalPredicate   = alignMyArray[0];
			var myHorizontalPredicate = alignMyArray[1];

			var alignToArray = alignToAttr.split(' ');
			if (alignToArray.length !== 2) {return;}

			var itsVerticalPredicate   = alignToArray[0];
			var itsHorizontalPredicate = alignToArray[1];

			result = {
				horizontal: {
					my: myHorizontalPredicate,
					its: itsHorizontalPredicate
				},
				vertical: {
					my: myVerticalPredicate,
					its: itsVerticalPredicate
				}
			};6
		}
	}

	return result;
};


/**
	@param hPos [obj] Horizontal predicates
	@param flyoutContainerPos [BoxData]
	@param flyoutAnchorElemPos [BoxData]

	@return [int] pixels the container element should be left of the window edge
**/
positioner.getLeftPos = function(hPos, flyoutContainerPos, flyoutAnchorElemPos) {
	var elemLeft = 0;
	if (hPos.my === 'center') {
		if (hPos.its === 'center') {
			elemLeft = (flyoutAnchorElemPos.left + (flyoutAnchorElemPos.width / 2) - (flyoutContainerPos.width / 2)) + 'px'
		} else if (hPos.its === 'left') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width / 2) + 'px';
		} else if (hPos.its === 'right') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width / 2) + 'px';
		}
	} else if (hPos.my === 'left') {
		if (hPos.its === 'center') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width / 2) + 'px';
		} else if (hPos.its === 'left') {
			elemLeft = (flyoutAnchorElemPos.left) + 'px';
		} else if (hPos.its === 'right') {
			elemLeft = (flyoutAnchorElemPos.left + flyoutAnchorElemPos.width) + 'px';
		}
	} else if (hPos.my === 'right') {
		if (hPos.its === 'center') {
			elemLeft = (flyoutAnchorElemPos.left - flyoutAnchorElemPos.width / 2) + 'px';
		} else if (hPos.its === 'left') {
			elemLeft = (flyoutAnchorElemPos.left - flyoutContainerPos.width) + 'px';
		} else if (hPos.its === 'right') {
			elemLeft = (flyoutAnchorElemPos.left - flyoutContainerPos.width + flyoutAnchorElemPos.width) + 'px';
		}
	}

	return elemLeft;
};

/**
	@param hPos [obj] Vertical predicates
	@param flyoutContainerPos [BoxData]
	@param flyoutAnchorElemPos [BoxData]

	@return [int] pixels the container element should be below the window edge
**/
positioner.getTopPos = function(vPos, flyoutContainerPos, flyoutAnchorElemPos) {
	var elemTop = 0;
	if (vPos.my === 'center') {
		if (vPos.its === 'center') {
			elemTop = (flyoutAnchorElemPos.left - flyoutAnchorElemPos.width / 2) + 'px';
		} else if (vPos.its === 'top') {
			elemTop = (flyoutAnchorElemPos.left - flyoutAnchorElemPos.width / 2) + 'px';
		} else if (vPos.its === 'bottom') {
			elemTop = (flyoutAnchorElemPos.left - flyoutAnchorElemPos.width / 2) + 'px';
		}
	} else if (vPos.my === 'top') {
		if (vPos.its === 'center') {
			elemTop = (flyoutAnchorElemPos.left) + 'px';
		} else if (vPos.its === 'top') {
			elemTop = (flyoutAnchorElemPos.top) + 'px';
		} else if (vPos.its === 'bottom') {
			elemTop = (flyoutAnchorElemPos.top + flyoutAnchorElemPos.height) + 'px';
		}
	} else if (vPos.my === 'bottom') {
		if (vPos.its === 'center') {
			elemTop = (flyoutAnchorElemPos.left - flyoutAnchorElemPos.width / 2) + 'px';
		} else if (vPos.its === 'top') {
			elemTop = (flyoutAnchorElemPos.top - flyoutContainerPos.height) + 'px';
		} else if (vPos.its === 'bottom') {
			elemTop = (flyoutAnchorElemPos.top - flyoutContainerPos.height + flyoutAnchorElemPos.height) + 'px';
		}
	}

	return elemTop;
};


positioner.position = function(flyoutElem, anchorElem, predicates) {
	var positioning = positioner.extractElemPostion(predicates.flyout, predicates.anchor);
	if (positioning) {
		var anchorElemPos = Helpers.getBoxData(anchorElem);
		var flyoutElemPos = Helpers.getBoxData(flyoutElem);

		var elemLeft = positioner.getLeftPos(positioning.horizontal, flyoutElemPos, anchorElemPos);
		var elemTop = positioner.getTopPos(positioning.vertical, flyoutElemPos, anchorElemPos);

		return window.requestAnimationFrame(function() {
			flyoutElem.style.left = elemLeft;
			flyoutElem.style.top = elemTop;
			flyoutElem.style.visibility = 'visible';
		});
	}

};


module.exports = Object.create(positioner);