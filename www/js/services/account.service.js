angular.module('account.service', [])
        .factory('Account', ["$http", "$q", "$ionicPlatform", "$cordovaCamera", "$cordovaToast", "$cordovaDatePicker", "$cordovaContacts", "Setting",
                function($http, $q, $ionicPlatform, $cordovaCamera, $cordovaToast, $cordovaDatePicker, $cordovaContacts, Setting) {
                        var s = Setting;
                        var account = {
                                /**
                                 * [signined description]
                                 * @type {[type]}
                                 */
                                signined: localStorage.getItem("account") ? true : false,
                                /**
                                 * [singIn description]
                                 * @param  {[type]} data [description]
                                 * @return {[type]}      [description]
                                 */
                                singIn: function(data) {
                                        var deferred = $q.defer();
                                        $http.jsonp(s.getUrl("mblr_appLogin"), s.handleParams(data)).then(function(rep) {
                                                deferred.resolve(rep);
                                        }, function(rep) {
                                                deferred.reject(rep);
                                        });
                                        return deferred.promise;
                                },
                                /**
                                 * 存储用户数据
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                storeUser: function(arg) {
                                        this.signined = true;
                                        localStorage.setItem("account", JSON.stringify(arg));
                                },
                                reload: function() {
                                        var deferred = $q.defer(),
                                                self = this;
                                        $http.jsonp(s.getUrl("mbus_getUserDetails"), s.handleParams({ userid: self.getUser().userid }, false))
                                                .then(function(resp) {
                                                        if (resp.data.state == "ok") {
                                                                self.storeUser(resp.data.data);
                                                        }
                                                        deferred.resolve(resp.data.data);
                                                }, function(resp) {
                                                        deferred.reject(resp);
                                                })
                                        return deferred.promise;
                                },
                                /**
                                 * 注册 检查用户数据是否通过验证
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                checkusr: function(arg) {
                                        var deferred = $q.defer();
                                        $http.jsonp(s.getUrl("mblr_checkreg"), s.handleParams(arg))
                                                .then(function(resp) {
                                                        deferred.resolve(resp.data);
                                                }, function(resp) {
                                                        deferred.reject(resp);
                                                });
                                        return deferred.promise;
                                },
                                /**
                                 * [getUser description]
                                 * @return {[type]} [description]
                                 */
                                getUser: function() {
                                        return JSON.parse(localStorage.getItem("account"));
                                },
                                /**
                                 * 扫码 获取推荐人
                                 * @param  {[type]} userid [description]
                                 * @return {[type]}        [description]
                                 */
                                gainUserById: function(userid) {
                                        var defer = $q.defer(), _this = this, sender = {'userid': userid};
                                        $http.jsonp(s.getUrl('mbus_gainUserById'), s.handleParams(sender)).then(function(resp) {
                                                if(resp.data) {
                                                        if(resp.data.state == 'no') {
                                                                Setting.prompt('获取推荐人失败');
                                                        } else {
                                                                defer.resolve(resp.data.data);
                                                        }
                                                } else {
                                                        Setting.prompt('获取推荐人失败');
                                                }
                                        }, function(resp) {
                                                Setting.prompt('error');
                                                defer.reject(resp);
                                        });
                                        return defer.promise;
                                },

                                /**
                                 * [signOut description]
                                 * @return {[type]} [description]
                                 */
                                signOut: function() {
                                        this.signined = false;
                                        localStorage.removeItem("account");
                                },
                                /**
                                 * [getUserDetail description]
                                 * @return {[type]} [description]
                                 */
                                getUserDetail: function() {
                                        var _this = this,
                                                defer = $q.defer();
                                        var params = {
                                                userid: _this.getUser().userid
                                        }
                                        $http.jsonp(s.getUrl("mbus_getUserDetails"), s.handleParams(params))
                                                .then(function(resp) {
                                                        defer.resolve(resp.data);
                                                }, function(resp) {
                                                        defer.reject(resp)
                                                });
                                        return defer.promise;
                                },
                                /**
                                 * 上传用户头像
                                 * @param  {[type]} imgData [description]
                                 * @return {[type]}         [description]
                                 */
                                uploadHeader: function(imgData) {
                                        var _this = this,
                                                params = {
                                                        userid: _this.getUser().userid,
                                                        imgdata: imgData
                                                };
                                        $http.jsonp(s.getUrl("mbus_uploadHeader"), s.handleParams(params))
                                                .then(function(resp) {
                                                        if (resp.data.state == "no") {
                                                                $ionicPlatform.ready(function() {
                                                                        $cordovaToast.showShortCenter('上传头像失败');
                                                                });
                                                        } else {
                                                                Setting.prompt("头像上传成功");
                                                        }
                                                        _this.reload();
                                                }, function(resp) {
                                                        $ionicPlatform.ready(function() {
                                                                $cordovaToast.showShortCenter('上传头像失败');
                                                        });
                                                })
                                },
                                /**
                                 * 更新用户
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                updateUser: function(arg) {
                                        var _user = {}, defer = $q.defer();
                                        for (item in arg) {
                                                var _prop = 'user.' + item;
                                                _user[[_prop]] = arg[item];
                                        }
                                        _user['user.userid'] = this.getUser().userid;

                                        $http.jsonp(s.getUrl("mbus_updateUser"), s.handleParams(_user))
                                        .then(function(resp) {
                                                defer.resolve(resp.data);
                                        }, function(resp) {
                                                defer.reject(resp);
                                        })
                                        return defer.promise;
                                },
                                /**
                                 * 会员升级，请求支付信息
                                 * @param  {[type]} params [description]
                                 * @return {[type]}        [description]
                                 */
                                upgrade: function(params) {
                                        var defer = $q.defer();
                                        params.userid = this.getUser().userid;
                                        $http.jsonp(s.getUrl("mbus_mobile_AccUpgrade"), s.handleParams(params))
                                        .then(function(resp) {
                                                if(resp.data) {
                                                        defer.resolve(resp.data);
                                                }
                                        }, function(resp) {
                                                defer.reject(resp);
                                        });
                                        return defer.promise;
                                },
                                /**
                                 * [获取余额]
                                 * @return {[type]} [description]
                                 */
                                getBalance: function() {
                                        var deferred = $q.defer();
                                        var sender = {
                                                userid: this.getUser().userid
                                        }
                                        $http.jsonp(s.getUrl("mbus_balance"), s.handleParams(sender)).then(function(resp) {
                                                deferred.resolve(resp.data);
                                        }, function(resp) {
                                                deferred.reject(resp);
                                        })
                                        return deferred.promise;
                                },
                                /**
                                 * 获取银行列表
                                 * @return {[type]} [description]
                                 */
                                getBanks: function() {
                                        var deferred = $q.defer();
                                        $http.jsonp(s.getUrl("mbul_gainbank"), s.handleParams()).then(function(resp) {
                                                deferred.resolve(resp.data);
                                        }, function(resp) {
                                                deferred.reject(resp);
                                        })
                                        return deferred.promise;
                                },
                                /**
                                 * 获取城市列表
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                getAreas: function(arg) {
                                        var deferred = $q.defer();
                                        $http.jsonp(s.getUrl("mbul_searchRegion"), s.handleParams(arg))
                                                .then(function(resp) {
                                                        deferred.resolve(resp.data)
                                                }, function(resp) {
                                                        deferred.reject(resp);
                                                })
                                        return deferred.promise;
                                },
                                
                                sendCode: function(arg, effect) {
                                        var _params = {
                                                phone: arg
                                        }, action = '';

                                        switch(effect) {
                                                //注册
                                                case 0:
                                                        action = 'mblr_validatePhoneNumber';
                                                        break;
                                                //忘记密码
                                                case 1:
                                                        action = 'mblr_forgetPass';
                                                        break;
                                                //改变手机号码
                                                case 2:
                                                        action = 'mbus_sendCodeOldPhone';
                                                        break;
                                                //新手机号验证
                                                case 3:
                                                        action = 'mbus_sendCodeAuthentication';
                                                        break;
                                        }
                                        var deferred = $q.defer();
                                        $http.jsonp(s.getUrl(action), s.handleParams(_params)).then(function(resp) {
                                                deferred.resolve(resp.data);
                                        }, function(resp) {
                                                deferred.reject(resp);
                                        });
                                        return deferred.promise;
                                },
                                /**
                                 * 修改密码
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                modPass: function(arg) {
                                        var deferred = $q.defer();
                                        $http.jsonp(s.getUrl("mblr_changePass"), s.handleParams(arg)).then(function(resp) {
                                                deferred.resolve(resp.data);
                                        }, function(resp) {
                                                deferred.reject(resp);
                                        });
                                        return deferred.promise;
                                },
                                /**
                                 * 余额体现
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                withdraw: function(arg) {
                                        var deferred = $q.defer();
                                        arg.userid = this.getUser().userid;
                                        $http.jsonp(s.getUrl("mbus_withdraw"), s.handleParams(arg)).then(function(resp) {
                                                deferred.resolve(resp.data);
                                        }, function(resp) {
                                                deferred.reject(resp);
                                        });
                                        return deferred.promise;
                                },
                                /**
                                 * 获取白(红)积分列表
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                pointList: function(arg) {
                                        var deferred = $q.defer();
                                        arg.userid = this.getUser().userid;
                                        $http.jsonp(s.getUrl("mbjf_getUserBaiJiFen"), s.handleParams(arg)).then(function(resp) {
                                                deferred.resolve(resp.data);
                                        }, function(resp) {
                                                deferred.reject(resp);
                                        })
                                        return deferred.promise;
                                },
                                /**
                                 * 白积分充值
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                whiteRechargePoint: function(arg) {
                                        var deferred = $q.defer;
                                        arg.userid = this.getUser().userid;
                                        $http.jsonp(s.getUrl("mbus_jifenquanchongzhi"), s.handleParams(arg))
                                                .then(function(resp) {
                                                        deferred.resolve(resp.data);
                                                }, function(resp) {
                                                        deferred.reject(resp);
                                                })
                                        return deferred.promise;
                                },
                                /**
                                 * 红积分兑换
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                exchangeRedPoint: function(arg) {
                                        var deferred = $q.defer();
                                        arg.userid = this.getUser().userid;
                                        $http.jsonp(s.getUrl("mbus_exchangeRedPoint"), s.handleParams(arg))
                                                .then(function(resp) {
                                                        deferred.resolve(resp.data);
                                                }, function(resp) {
                                                        deferred.reject(resp);
                                                })
                                        return deferred.promise;
                                },
                                /**
                                 * 资金明细
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                assetsList: function(arg) {
                                        var deferred = $q.defer();
                                        arg.userid = this.getUser().userid;
                                        $http.jsonp(s.getUrl("mbus_assets"), s.handleParams(arg))
                                                .then(function(resp) {
                                                        deferred.resolve(resp.data);
                                                }, function(resp) {
                                                        deferred.reject(resp);
                                                });
                                        return deferred.promise;
                                },
                                /**
                                 * 我的推荐人
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                mychilds: function(arg) {
                                        var deferred = $q.defer();
                                        arg.userid = this.getUser().userid;
                                        $http.jsonp(s.getUrl("mbus_gettjusers"), s.handleParams(arg))
                                                .then(function(resp) {
                                                        deferred.resolve(resp.data)
                                                }, function(resp) {
                                                        deferred.reject(resp);
                                                })
                                        return deferred.promise;
                                },
                                /**
                                 * 注册
                                 * @param  {[type]} arg [description]
                                 * @return {[type]}     [description]
                                 */
                                register: function(arg) {
                                        var deferred = $q.defer();
                                        $http.jsonp(s.getUrl("mblr_register"), s.handleParams(arg))
                                                .then(function(resp) {
                                                        deferred.resolve(resp.data);
                                                }, function(resp) {
                                                        deferred.reject(resp);
                                                })
                                        return deferred.promise;
                                },
                                /**
                                 * 用户收货人
                                 * @return {[type]} [description]
                                 */
                                takeAddrs: function() {
                                        var defer = $q.defer(),
                                                _this = this;
                                        var params = {
                                                userid: _this.getUser().userid
                                        }
                                        $http.jsonp(s.getUrl("mbus_takeAddrs"), s.handleParams(params, false))
                                                .then(function(resp) {
                                                        defer.resolve(resp.data);
                                                }, function(resp) {
                                                        defer.reject(resp);
                                                });
                                        return defer.promise;
                                },
                                /**
                                 * 添加修改用户收货人信息
                                 * @param  {[type]} addr [description]
                                 * @return {[type]}      [description]
                                 */
                                addressAction: function(addr, method) {
                                        var defer = $q.defer(),
                                                _addr = {};
                                        for (item in addr) {
                                                var _prop = 'address.' + item;
                                                _addr[[_prop]] = addr[item];
                                        }
                                        _addr.method = method;
                                        _addr["address.usersid"] = this.getUser().userid;
                                        console.log(angular.toJson(addr));
                                        $http.jsonp(s.getUrl("mbus_addressAction"), s.handleParams(_addr, false))
                                                .then(function(resp) {
                                                        defer.resolve(resp.data);
                                                }, function(resp) {
                                                        defer.reject(resp);
                                                });
                                        return defer.promise;
                                },

                                delAddress: function(addr) {
                                        var defer = $q.defer(),
                                                _addr = {};
                                        for (item in addr) {
                                                var _prop = 'address.' + item;
                                                _addr[[_prop]] = addr[item];
                                        }
                                        _addr["address.usersid"] = this.getUser().userid;

                                        $http.jsonp(s.getUrl("mbus_delAddress"), s.handleParams(_addr))
                                                .then(function(resp) {
                                                        defer.resolve(resp.data);
                                                }, function(resp) {
                                                        defer.reject(resp);
                                                });
                                        return defer.promise;
                                },
                                /**
                                 * 获取省市区信息
                                 * @param  {[type]} areaId [description]
                                 * @return {[type]}        [description]
                                 */
                                takeArea: function(code) {
                                        var defer = $q.defer();
                                        var params = {
                                                code: code
                                        }
                                        $http.jsonp(s.getUrl("mbul_searchRegion"), s.handleParams(params))
                                                .then(function(resp) {
                                                        defer.resolve(resp.data);
                                                }, function(resp) {
                                                        defer.reject(resp);
                                                })
                                        return defer.promise;
                                },
                                /**
                                 * 获取订单数据
                                 * @param  {[type]} arg 订单状态
                                 * @return {[type]}     [description]
                                 */
                                getOrder: function(arg, _page) {
                                        var _this = this, params = {
                                                userid: _this.getUser().userid,
                                                orderType: arg,
                                                page: _page
                                        }, defer = $q.defer();

                                        $http.jsonp(s.getUrl("mbop_takeOrder"), s.handleParams(params, false))
                                        .then(function(resp) {
                                                var data = resp.data;
                                                switch(arg) {
                                                        case 0:
                                                                data = _this.handleOrder_all(data);
                                                                break;
                                                        case 1:
                                                                data = _this.handleOrder_waitPay(data);
                                                                break;
                                                        case 2:
                                                                data = _this.handleOrder_waitTake(data);
                                                                break;
                                                        case 3:
                                                                data = _this.handleOrder_compalte(data);
                                                                break;
                                                }
                                                defer.resolve(data);
                                        }, function(resp) {
                                                defer.reject(resp);
                                        });
                                        return defer.promise;
                                },
                                handleOrder_all: function(data) {
                                        angular.forEach(data.data, function(sen, inx) {
                                                if(sen.status == "待收货") {
                                                        sen.allowDel = false;
                                                } else {
                                                        sen.allowDel = true;
                                                }
                                        });
                                        return data;
                                },
                                handleOrder_waitPay: function(data){
                                        angular.forEach(data.data, function(sen, inx) {
                                                sen.allowDel = true;
                                        });
                                        return data;
                                },
                                handleOrder_waitTake: function(data) {
                                        angular.forEach(data.data, function(sen, inx) {
                                                sen.allowDel = false;
                                        });
                                        return data;
                                },
                                handleOrder_compalte: function(data) {
                                        angular.forEach(data.data, function(sen, inx) {
                                                sen.allowDel = true;
                                        });
                                        return data;
                                },

                                takePhoto: function(source) {
                                        var defer = $q.defer(),
                                                _this = this;
                                        $ionicPlatform.ready(function() {
                                                var options = {
                                                        quality: 80,
                                                        destinationType: Camera.DestinationType.DATA_URL,
                                                        sourceType: source == 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
                                                        encodingType: Camera.EncodingType.JPEG,
                                                        mediaType: Camera.MediaType.PICTURE,
                                                        popoverOptions: Camera.PopoverArrowDirection.ARROW_DOWN,
                                                        correctOrientation: true,
                                                        saveToPhotoAlbum: false,
                                                        allowEdit: true,
                                                        targetWidth: 100,
                                                        targetHeight: 100
                                                };
                                                $cordovaCamera.getPicture(options).then(function(imageData) {
                                                        var showImage = "data:image/jpeg;base64," + imageData;
                                                        _this.uploadHeader(imageData);
                                                        defer.resolve(showImage);
                                                }, function(err) {
                                                        defer.reject(err);
                                                })
                                        });
                                        return defer.promise;
                                },

                                chooseDate: function(_date) {
                                        var defer = $q.defer();
                                        if(!_date) {
                                                _date = new Date();
                                        } else {
                                                if(_date.getMonth() == 0) {
                                                        _date.setFullYear(_date.getFullYear() - 1);
                                                        _date.setMonth(11);
                                                } else {
                                                        _date.setMonth(_date.getMonth() - 1);
                                                }
                                        }
                                        
                                        $ionicPlatform.ready(function() {
                                                var options = {
                                                        mode: 'date',
                                                        date: _date,
                                                        allowOldDates: true,
                                                        allowFutureDates: false
                                                }
                                                $cordovaDatePicker.show(options).then(function(date) {
                                                        defer.resolve(date);
                                                });
                                        });
                                        return defer.promise;
                                },

                                chooseContact: function() {
                                        var defer = $q.defer();
                                        $ionicPlatform.ready(function() {
                                                $cordovaContacts.pickContact().then(function(contcat) {
                                                        var arr = new Array();
                                                        angular.forEach(contcat.phoneNumbers, function(o, i) {
                                                                var temp = o.value;
                                                                while (temp.includes('-') || temp.includes(' ')) {
                                                                        temp = temp.replace(' ', '').replace(/(-)/, '');
                                                                }
                                                                arr.push(temp);
                                                        });
                                                        var _contcat = {
                                                                displayName: contcat.displayName,
                                                                name: contcat.name,
                                                                phones: arr
                                                        }
                                                        defer.resolve(_contcat);
                                                 }, function(error) {
                                                        var errMsg = undefined;
                                                        switch(error) {
                                                                case ContactError.UNKNOWN_ERROR:
                                                                        errMsg = "未知原因, 获取联系人失败"
                                                                        break;
                                                                case ContactError.INVALID_ARGUMENT_ERROR:
                                                                        errMsg = "参数无效, "
                                                                        break;
                                                                case ContactError.TIMEOUT_ERROR:
                                                                        errMsg = "加载超时, 获取联系人失败"
                                                                        break;
                                                                case ContactError.IO_ERROR:
                                                                        errMsg = "读取错误, 获取联系人失败"
                                                                        break;
                                                                case ContactError.NOT_SUPPORTED_ERROR:
                                                                        errMsg = "暂不支持您的设备"
                                                                        break;
                                                                case ContactError.PERMISSION_DENIED_ERROR:
                                                                        errMsg = "没有权限获取联系人"
                                                                        break;
                                                        }
                                                        if(errMsg) {
                                                                $cordovaToast.showShortCenter(errMsg);
                                                        }
                                                })
                                        });
                                        return defer.promise;
                                }
                        };
                        return account;
                }
        ])
