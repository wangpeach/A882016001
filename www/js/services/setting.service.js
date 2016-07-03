angular.module('setting.service', ['ionic'])
    .factory("Setting", ["$ionicModal", "$window", "$q", "$ionicPlatform", "$cordovaToast", "$http",
     function($ionicModal, $window, $q, $ionicPlatform, $cordovaToast, $http) {

        if (!localStorage.getItem("config")) {
            localStorage.setItem("config", JSON.stringify({ showBalance: false }));
        }
        var _config = JSON.parse(localStorage.getItem("config"));

        return {

            config: _config,
            host: "http://www.yunhuitianxia.com/",
            // host: "http://127.0.0.1:8080/T882015009/",
            upgrade_url: "",
            bzamount: 999,

            /**
             * [setConfig description]
             * @param {[type]} arg [description]
             */
            setConfig: function(arg) {
                config = arg;
                localStorage.setItem("config", JSON.stringify(arg));
            },

            /**
             * 是否显示余额
             * @param  {[type]} arg [description]
             * @return {[type]}     [description]
             */
            swipBalance: function() {
                if (this.config.showBalance) {
                    this.config.showBalance = false;
                } else {
                    this.config.showBalance = true;
                }
                this.setConfig(this.config);
            },

            getUrl: function(arg) {
                return this.host + arg;
            },

            handleParams: function(data, caching) {
                var sender = {};
                data = data || {};
                data.callback = "JSON_CALLBACK";
                data.version = "1.0.0";
                sender.params = data;
                if(caching == undefined) {
                    sender.cache = true;
                } else {
                    sender.cache = false;
                }
                //超时20秒
                sender.timeout = 20000;
                return sender;
            },

            formatPhone: function(phone) {
                if(phone) {
                    return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
                }
            },

            /**
             * 获取url参数
             * @param  {[type]} url   [description]
             * @param  {[type]} paras [description]
             * @return {[type]}       [description]
             */
            getUrlParams: function(url, paras) {
                var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
                var paraObj = {}
                for (i = 0; j = paraString[i]; i++) {
                    paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
                }
                var returnValue = paraObj[paras.toLowerCase()];
                if (typeof (returnValue) == "undefined") {
                    return "";
                } else {
                    return (unescape(returnValue.replace(/\\u/gi, '%u')));
                }
            },

            toFloat: function(arg) {
                return parseFloat(arg);
            },

            /**
             * 发送请求统一入口
             * @param  {[type]} server  [description]
             * @param  {[type]} params  [description]
             * @param  {[type]} headers [description]
             * @return {[type]}         [description]
             */
            sendRequest: function(server, params, headers) {
                var that = this;
                var defer = $q.defer();
                
                if($window.cordova && ionic.Platform.isIOS()) {
                    headers = (headers || {});
                    window.cordovaHTTP.post(that.getUrl(server), params, headers, function(response) {
                        defer.resolve(response);
                    }, function(response) {
                        defer.reject(response);
                    });
                } else {
                    $http.jsonp(that.getUrl(server), that.handleParams(params))
                    .then(function(response) {
                        defer.resolve(response);
                    }, function(response) {
                        defer.reject(response);
                    });
                }
                return defer.promise;
            },


            openModal: function(template, _scope, animate) {
                var animation = "animated ", defer = $q.defer();
                if(animate) {
                    animation += animate;
                } else {
                    animation += "slideInRight";
                }
                $ionicModal.fromTemplateUrl(template, {
                    scope: _scope,
                    animation: animation
                }).then(function(modal) {
                    defer.resolve(modal);
                });
                return defer.promise;
            },

            /**
             * 消息提示
             * @param  {[type]} msg [description]
             * @return {[type]}     [description]
             */
            prompt: function(msg) {
                $ionicPlatform.ready(function() {
                    $cordovaToast.showShortCenter(msg);
                });
            }
        };
    }]);
