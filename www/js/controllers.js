angular.module('starter.controllers', ["ionic", "home.controller", "sort.controller", "cart.controller", "account.controller", "products.controller"])
.controller('RootCtrl', ["$scope", "$rootScope", "$ionicLoading", "$timeout", function($scope, $rootScope, $ionicLoading, $timeout) {
	$rootScope.prompt = function(info, timeout) {
		if (!info) {
			info = '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>';
		}
		if (!timeout) {
			timeout = 1500;
		}
		var info = '<div style="background: rgba(0,0,0,0.6); width: auto; padding: 0px 10px; border-radius: 6px; height: 40px; line-height: 40px;">'+ info +'</div>';
		$ionicLoading.show({
			template: info,
			showBackdrop: false
		});
		$timeout(function() {
			$ionicLoading.hide();
		}, timeout);
	}
}]);