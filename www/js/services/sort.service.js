angular.module('sort.service', [])
.factory('Sort', ["$http", "$q", "Setting", function($http, $q,  Setting) {
	var sort =  {
		getClassify : function() {
			var defer = $q.defer();
			if(localStorage.getItem("classify")) {
				defer.resolve(JSON.parse(localStorage.getItem("classify")));
			} else {
				this.requestClassify().then(function(data) {
					defer.resolve(data);
				}, function(resp) {
					defer.reject(resp);
				});
			}
			return defer.promise;
		},
		requestClassify : function() {
			var deferred = $q.defer();
			// $http.jsonp(Setting.getUrl("mbpt_classify"), Setting.handleParams())
			Setting.sendRequest("mbpt_classify", {}, {})
			.then(function(resp) {
				localStorage.setItem("classify", JSON.stringify(resp.data));
				deferred.resolve(resp.data);
			}, function(resp) {
				deferred.reject(resp);
			});
			return deferred.promise;
		}
	}
	return sort;
}])