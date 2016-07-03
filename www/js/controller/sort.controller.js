angular.module("sort.controller", ["ionic"])
	.controller('SortCtrl', ["$scope", "$rootScope", "$state", "$ionicScrollDelegate", "$timeout", "$window", "Sort", 
		function($scope, $rootScope, $state, $ionicScrollDelegate, $timeout, $window, Sort) {

		$scope.cancel = false;
		$scope.searchSender = {
			key: null,
			placeholder: '搜索商品'
		}

		$scope.search = function(arg) {
			if (!arg.key) {
				arg.key = $scope.searchSender.placeholder;
			}
			$state.go('tab.sort-products-list', {backWhere: 'tab.sort', searchType: 'key', key: arg.key });
		}

		Sort.getClassify().then(function(data) {
			$scope.classify = data;
		}, function(resp) {
			$rootScope.prompt("获取分类失败");
		});

		$scope.clearKey = function(arg) {
			$scope.searchSender.key = null;
			$timeout(function() {
				$scope.cancel = arg;
			}, 5);
			return false;
		}


		$scope.searchSwipe = function(arg) {
			$scope.cancel = arg;
		}

		$scope.swipe = function(mod) {
			for (var i = 0; i < $scope.classify.length; i++) {
				if ($scope.classify[i].checked == "true") {
					$scope.classify[i].checked = "false";
					if ($scope.classify[i].carriers && $scope.classify[i].carriers.length > 0) {
						$scope.classify[i].carriers[0].checked = "flase";
					}
				}
			}
			// $scope.classify
			mod.checked = "true";
			if (mod.carriers && mod.carriers.length > 0) {
				mod.carriers[0].checked = "true";
			}
			$ionicScrollDelegate.$getByHandle("level2").scrollTop(800);
		}

		$scope.goProductList = function(arg) {
			$state.go("tab.sort-products-list", {backWhere: 'tab.sort', searchType: 'classify', key: arg});
		}

		$scope.$on("$ionicView.enter", function() {
				$scope.contentStyle = {
					height: $window.innerHeight - (44 + 50) + "px"
				}
			});
	}])
