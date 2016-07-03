/**
* slideBox Module
*
* Description
*/
angular.module('ws', []).
.directive('wsSlideBox', ['$document', '$timeout', '$animate', '$compile',  function($document, $timeout, $animate, $compile){
	// Runs during compile
	return {
		scope: {
			autoPlay: '=',
			doesContinue: '@',
			slideInterval: '@',
		},
		controller: ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) {
			var _this = this;
			var continue = $scope.$evel($scope.doesContinue) === true;
			
		}],
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
		template: '<div ></div>',
		// templateUrl: '',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			
		}
	};
}]);