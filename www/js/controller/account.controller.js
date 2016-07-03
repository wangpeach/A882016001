angular.module("account.controller", ["ionic"])
	//我的 主页
	.controller('AccountCtrl', ["$scope", "$rootScope", "$state", "$stateParams", "$location", "$ionicPlatform", "$ionicModal", "$ionicLoading", "$timeout", "$interval", "$ionicSlideBoxDelegate", "Account", "Setting",
		function($scope, $rootScope, $state, $stateParams, $location, $ionicPlatform, $ionicModal, $ionicLoading, $timeout, $interval, $ionicSlideBoxDelegate, Account, Setting) {
			

			//默认显示登陆
			$scope.why = "Login";

			$scope.accountInfoModal = function() {
				$scope.user = Account.getUser();

				if($scope.user.userheader.endsWith('null')) {
					$scope.user.userheader = "img/iconfont-myfill2.png";
				}

				$scope.viewBalance = function() {
					$scope.balance = Setting.config.showBalance ? $scope.user.usermomoney : "****";
					$scope.showBalance = Setting.config.showBalance ? "icon-eye" : "icon-eye-outline";
				}

				$scope.changeBalance = function($event) {
					$event.stopPropagation();
					Setting.swipBalance();
					$scope.viewBalance();
				}

				$scope.doRefresh = function() {
					Account.reload().then(function(data) {
						$scope.user = data;
						$scope.accountInfoModal();
					}, function() {

					}).finally(function() {
						$scope.$broadcast('scroll.refreshComplete');
					})
				}

				$scope.viewBalance();
			}

			//账户登陆注册模块
			$scope.sinregModal = function() {

					$scope._reguser = {};

					$scope.regexp = {
						username: /[^\u4e00-\u9fa5]/g,
						email: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
						useridcard: /^[1-9][0-9]{5}(19[0-9]{2}|200[0-9]|2010)(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[0-9]{3}[0-9xX]$/,
						phone: /^1[3|4|5|7|8][0-9]{9}$/
					}

					$scope.againNum = 0;
					$scope.againText = "获取验证码";
					$scope.iden = {
						userphone: ""
					}

					$ionicModal.fromTemplateUrl('templates/sinreg.html', {
						scope: $scope,
						animation: 'slide-in-up'
					}).then(function(modal) {
						$scope.modal = modal;
					});

					//显示账户模块
					$scope.signOrReg = function() {
							$scope.why = "Login";
							$scope.modal.show();
						}
						//取消登陆
					$scope.cancelSR = function() {
						$scope.modal.hide();
					}


					//切换账户子模块 why = Login || Register || ResetPass
					$scope.switch = function(why) {
						$scope.why = why;
					}

					//注册  禁止用户切换面板，只可程序控制
					$scope.disableSwipe = function() {
						$ionicSlideBoxDelegate.enableSlide(false);
					}

					/**
					 * 扫码
					 * @return {[type]} [description]
					 */
					$scope.currentlyScanning = false;
					$scope.scanCode = function($event) {
						$event.stopPropagation();
						if (!$scope.currentlyScanning) {
							$scope.currentlyScanning = true;
							$ionicPlatform.ready(function() {
								var config = {
									"showFlipCameraButton": true, // iOS and Android
									"prompt": "请将二维码置于取景框内",
									"formats": "QR_CODE",
									"orientation": "portrait"
								};
								cordova.plugins.barcodeScanner.scan(function(result) {
									if(!result.cancelled) {
										$ionicLoading.show({
											template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
											showBackdrop: false
										});
										var userid = Setting.getUrlParams(result.text, 'registerp');
										Account.gainUserById(userid).then(function(data) {
											$scope.user = {
												temptjrn: data.username,
												usertuijianren: data.userid
											}
										}).finally(function() {
											$ionicLoading.hide();
										});
									} else {
										Setting.prompt('已取消');
									}
									$scope.currentlyScanning = false;
								}, function(error) {
									Setting.prompt('扫描二维码错误');
									$scope.currentlyScanning = false;
								}, config);
							});
						}
					}

					$scope._baseInfo = function(arg) {
							$ionicLoading.show({
								template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
								showBackdrop: false
							});
							for (item in arg) {
								var pep = 'user.' + item;
								$scope._reguser[[pep]] = arg[item];
							}
							Account.checkusr($scope._reguser).then(function(data) {
								if (data.state == "ok") {
									$ionicLoading.hide();
									if (!$scope.pros) {
										$scope.changeArea(3527, "provience");
									}
									$ionicSlideBoxDelegate.slide($ionicSlideBoxDelegate.currentIndex() + 1, 500);
								} else {
									$rootScope.prompt(data.reason);
								}
							}, function(resp) {
								$rootScope.prompt("error");
							})
						}
						//获取省市列表
					$scope.changeArea = function(areaobj, what) {
						$ionicLoading.show({
							template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						})
						var _code = -1;
						if ((typeof areaobj == "number")) {
							_code = areaobj;
						} else {
							switch (what) {
								case "city":
									_code = areaobj.provience.code;
									break;
								case "area":
									_code = areaobj.city.code;
									break;
							}
						}
						Account.getAreas({ code: _code })
							.then(function(data) {
								var data = data;
								switch (what) {
									case 'provience':
										$scope.pros = data;
										break;
									case 'city':
										$scope.cits = data;
										break;
									default:
										$scope.ares = data;
								}
								$ionicLoading.hide();
							}, function(resp) {
								$rootScope.prompt("error");
							});
					}

					$scope._back = function() {
						$ionicSlideBoxDelegate.slide($ionicSlideBoxDelegate.currentIndex() - 1, 500);
					}

					$scope.areaComplete = function(arg) {
						var _areaddr = arg.provience.code + "-" + arg.city.code + "-" + arg.area.code
						$scope._reguser["user.usertel"] = _areaddr;
						$ionicSlideBoxDelegate.slide($ionicSlideBoxDelegate.currentIndex() + 1, 500);
					}

					$scope.sendCode_Reg = function(arg) {
						$ionicLoading.show({
							template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						Account.sendCode(arg, 0).then(function(data) {
							if (data.status == "OK") {
								$scope.againNum = 60;
								$scope.code = data.code;
								var stop = $interval(function() {
									if ($scope.againNum > 0) {
										$scope.againNum--;
										$scope.againText = "请等待(" + $scope.againNum + ")";
									} else {
										$interval.cancel(stop);
										$scope.againText = "重新发送";
									}
								}, 1000);
								$rootScope.prompt("验证码已发送");
							} else {
								$rootScope.prompt(data.reason);
							}
						}, function(resp) {
							$rootScope.prompt("error");
						});
					}

					$scope.idenSubmit = function(arg) {
						if ($scope.code && $scope.code == arg.code) {
							Account.register($scope._reguser).then(function(data) {
								if (data.state == "ok") {
									$ionicLoading.show({
										template: "注册成功，请登录"
									});
									$timeout(function() {
										$ionicLoading.hide();
										$scope.why = "Login";
									}, 1500);
								} else {
									$rootScope.prompt(data.reason);
								}
							}, function(resp) {
								$rootScope.prompt("error");
							})
						} else {
							$rootScope.prompt("验证码错误");
						}
					}

					$scope.phone = {
							num: '',
							code: ''
						}
						//修改密码， 通过手机号码获取验证码
					$scope.sendCode_forget = function(arg) {
							$ionicLoading.show({
								template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
								showBackdrop: false
							});
							Account.sendCode(arg.num, 1).then(function(data) {
								if (data.state == "ok") {
									$ionicLoading.hide();
									$scope.code = data.reason;
									$rootScope.prompt("验证码已发送");
									$scope.againNum = 60;
									$scope.againText = "请等待(60)";
									var stop = $interval(function() {
										if ($scope.againNum > 0) {
											$scope.againNum--;
											$scope.againText = "请等待(" + $scope.againNum + ")";
										} else {
											$interval.cancel(stop);
											$scope.againText = "重新发送";
										}
									}, 1000);
								} else {
									$rootScope.prompt(data.reason);
								}
							}, function(resp) {
								$rootScope.prompt("error");
							});
						}
						//验证验证码
					$scope.goforget = function(arg) {
							if (arg.code == $scope.code) {
								$ionicSlideBoxDelegate.slide($ionicSlideBoxDelegate.currentIndex() + 1, 500);
							} else {
								$rootScope.prompt("验证码错误");
							}
						}
						//修改密码
					$scope.savePass = function(arg) {
						$ionicLoading.show({
							template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						var params = {
							phone: $scope.phone.num,
							password: arg.pass
						}
						Account.modPass(params).then(function(data) {
							if (data.state == "ok") {
								$ionicLoading.show({
									template: '修改成功'
								});
								$timeout(function() {
									$ionicLoading.hide();
									$scope.why = "Login";
								}, 1500);
							} else {
								$rootScope.prompt(data.reason);
							}
						}, function(resp) {

						})
					}

					//登录
					$scope.signIn = function(arg) {
						$ionicLoading.show({
							template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						var result = Account.singIn(arg).then(function(rep) {
							if (rep.data.state == "ok") {
								console.log(rep.data.data);
								//存储用户登录数据
								Account.storeUser(rep.data.data);
								$scope.cancelSR();
								$scope.modal.remove();
								$ionicLoading.hide();
								$scope.signed = true;
								$scope.accountInfoModal();
							} else {
								$rootScope.prompt(rep.data.reason);
							}
						}, function(rep) {
							$rootScope.prompt('登陆超时');
						});
					}
				}
			//验证是否已登录
			$scope.varificationModel = function(arg, params) {
				if (!$scope.signed) {
					$rootScope.prompt("请先登陆");
					$scope.signOrReg();
				} else {
					$state.go(arg, params);
				}
			}

			
			

			$scope.$on("$ionicView.enter", function () {
				//是否登录
				$scope.signed = Account.signined;
				$scope.signed ? $scope.accountInfoModal() : $scope.sinregModal();
			});

			$scope.goWhered = false;
			$scope.$on("$ionicView.afterEnter", function() {
				if ($stateParams.where) {
					// $location.search("where", '');
					var where = $stateParams.where;
					$location.url($location.path());
					$timeout(function() {
						$scope.varificationModel(where, {});
					}, 50);
				}
				console.log(Account.getUser());
			});
		}
	])
	//系统设置
	.controller('settingCtrl', ["$scope", "$state", "$ionicPopup", "$ionicHistory", "Account",
		function($scope, $state, $ionicPopup, $ionicHistory, Account) {
			$scope.signOut = function() {
				$ionicPopup.confirm({
					title: "确定退出吗?",
					cancelText: "取消",
					cancelType: "button-outline",
					okText: "确定",
					okType: "button-assertive"
				}).then(function(res) {
					if (res) {
						Account.signOut();
						$ionicHistory.goBack();
					}
				});
			}
		}
	])
	.controller('personalCtrl', ['$scope', '$rootScope', '$ionicLoading', '$ionicActionSheet', '$ionicModal', '$q', '$interval', 'Account',
		function($scope, $rootScope, $ionicLoading, $ionicActionSheet, $ionicModal, $q, $interval, Account) {

			$scope.account = Account.getUser();

			//修改头像
			$scope.changeHeader = function() {
				$ionicActionSheet.show({
					buttons: [
						{ text: "拍照" },
						{ text: "我的相册" }
					],
					cancelText: "取消",
					cancel: function() {},
					buttonClicked: function(index) {
						Account.takePhoto(index).then(function(imgData) {
							$scope.account.userheader = imgData;
							Account.reload();
						}, function(err) {
							$rootScope.prompt("获取头像失败");
						});
						return true;
					}
				});
			}

			$scope.valid = function() {
				$scope.againValText = "获取验证码";

				$scope.openModel("templates/personal-chphoneval.html").then(function(model) {
					model.show();

					$scope.takeValCode = function() {
						$ionicLoading.show({
							template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						Account.sendCode($scope.account.userphone, 2).then(function(data) {
							if (data.state == "ok") {
								$ionicLoading.hide();
								$scope.cpcode = data.reason;
								$rootScope.prompt("验证码已发送");
								$scope.againValNum = 60;
								$scope.againValText = "请等待(60)";
								var stop = $interval(function() {
									if ($scope.againValNum > 0) {
										$scope.againValNum--;
										$scope.againValText = "请等待(" + $scope.againValNum + ")";
									} else {
										$interval.cancel(stop);
										$scope.againValText = "重新发送";
									}
								}, 1000);
							} else {
								$rootScope.prompt(data.reason);
							}
						}, function(resp) {
							$rootScope.prompt("error");
						});
					}

					$scope.validCode = function(arg) {
						if ($scope.cpcode == arg.code) {
							$scope.changePhone();
						} else {
							$rootScope.prompt('验证码错误');
						}
					}

					$scope.closeValModel = function() {
						model.hide();
					}

					$scope.$on('$destroy', function() {
						model.remove();
					});
				});
			}

			$scope.changePhone = function() {
				$scope.openModel("templates/personal-change-phone.html").then(function(model) {
					$scope.againNPText = "获取验证码";
					model.show();

					$scope.chobj = {
						code: '',
						inCode: '',
						phone: ''
					}

					$scope.takeNPCode = function() {
						Account.sendCode($scope.account.userphone, 3).then(function(data) {
							if (data.state == "ok") {
								$ionicLoading.hide();
								$scope.chobj.code = data.reason;
								$rootScope.prompt("验证码已发送");
								$scope.againNPNum = 60;
								$scope.againNPText = "请等待(60)";
								var stop = $interval(function() {
									if ($scope.againNPNum > 0) {
										$scope.againNPNum--;
										$scope.againNPText = "请等待(" + $scope.againNPNum + ")";
									} else {
										$interval.cancel(stop);
										$scope.againNPText = "重新发送";
									}
								}, 1000);
							} else {
								$rootScope.prompt(data.reason);
							}
						}, function(resp) {
							$rootScope.prompt("error");
						});
					}

					$scope.closeNPModel = function() {
						model.hide();
					}

					$scope.savePhone = function() {
						if ($scope.chobj.code != $scope.chobj.inCode) {
							$scope.prompt('验证码错误');
						} else {
							var params = {
								userphone: $scope.chobj.phone
							}
							Account.updateUser(params).then(function(data) {
								$rootScope.prompt(data.reason);
							}, function(resp) {
								$rootScope.prompt("error");
							});
							$scope.account.userphone = $scope.chobj.phone;
							model.hide();
							$scope.closeValModel();
						}
					};

					$scope.$on('$destroy', function() {
						model.remove();
					});
				})
			}

			$scope.changeEmail = function() {
				$scope.openModel("templates/personal-change-email.html").then(function(model) {
					model.show();

					$scope.saveEmail = function(arg) {
						var params = {
							useremail: arg.email
						}
						Account.updateUser(params).then(function(data) {
							$rootScope.prompt(data.reason);
						}, function(resp) {
							$rootScope.prompt("error");
						});
						$scope.account.useremail = arg.email;
						model.hide();
					}

					$scope.closeEmailModel = function() {
						model.hide();
					}
				})
			}

			$scope.chooseBirthday = function() {
				var date = undefined,
					birday = undefined;
				if ($scope.account.userbirthday != null && $scope.account.userbirthday != "") {
					birday = $scope.account.userbirthday.split("-");
					date = new Date(parseInt(birday[0]), parseInt(birday[1]), parseInt(birday[2]));
				}
				Account.chooseDate(date).then(function(_date) {
					var bir = _date.getFullYear() + "-" + (_date.getMonth() + 1) + "-" + _date.getDate();
					$scope.account.userbirthday = bir;
					var params = {
						userbirthday: bir
					}
					Account.updateUser(params).then(function(data) {
						$rootScope.prompt(data.reason);
					}, function(resp) {
						$rootScope.prompt("error");
					});
				});
			}

			$scope.openModel = function(file) {
				var defer = $q.defer();
				$ionicModal.fromTemplateUrl(file, {
					scope: $scope,
					animation: 'animated slideInRight'
				}).then(function(model) {
					defer.resolve(model);
				});
				return defer.promise;
			}
		}
	])
	//收货地址
	.controller('addrCtrl', ["$scope", "$rootScope", "$state", "$ionicLoading", "$ionicTabsDelegate", "$ionicPopup", "Account", "Setting",
		function($scope, $rootScope, $state, $ionicLoading, $ionicTabsDelegate, $ionicPopup, Account, Setting) {
			$scope.noaddr = false;

			$scope.loadAddrs = function() {
				$ionicLoading.show({
					template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
					showBackdrop: false
				});
				Account.takeAddrs()
					.then(function(data) {
						if (data.state == "ok") {
							var _addr = [];
							angular.forEach(data.data, function(obj, inx) {
								obj.isdefault = (obj.isdefault == "true" ? true : false);
								_addr.push(obj);
							})
							$scope.addrs = _addr;

						} else {
							$scope.noaddr = true;
							$scope.prompt = data.reason;
						}
					}, function() {
						$rootScope.prompt('error');
					})
					.finally(function() {
						$ionicLoading.hide();
					});
			}

			$scope.swipeDefault = function(item, _default) {

				angular.forEach($scope.addrs, function(obj, inx) {
					obj.isdefault = false;
				});
				item.isdefault = true;
				var params = {
					id: item.id,
					isdefault: true
				}
				$ionicLoading.show({
					template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
					showBackdrop: false
				});
				Account.addressAction(params, 'upd').then(function(data) {
					$ionicLoading.hide();
					if(data.state != "ok") {
						Setting.prompt("请稍后再试!");
					}
				}, function() {
					Setting.prompt("error");
				});
			}

			$scope.updAddr = function(item) {
				$scope.showBar = false;
				var _addr = angular.toJson(item);
				$state.go("tab.setting-addrconfig", { action: 'upd', addr: _addr });
			}

			$scope.delAddr = function(item) {
				$ionicPopup.confirm({
					title: "确定删除该收货人吗?",
					cancelText: "取消",
					cancelType: "button-outline",
					okText: "确定",
					okType: "button-assertive"
				}).then(function(res) {
					if (res) {
						$ionicLoading.show({
							template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						Account.delAddress(item)
							.then(function(data) {
								if (data.state == "ok") {
									$scope.loadAddrs();
								}
								$rootScope.prompt(data.reason);
							}, function(resp) {
								$rootScope.prompt("error");
							});
					}
				})

			}

			$scope.goNewAddr = function() {
				$scope.showBar = false;
				$state.go("tab.setting-addrconfig", { action: 'add' });
			}

			$scope.formatPhone = function(phone) {
				return Setting.formatPhone(phone);
			}

			$scope.$on("$ionicView.enter", function() {
				$scope.loadAddrs();
			});
			$scope.$on("$ionicView.beforeEnter", function() {
				$scope.showBar = true;
				$ionicTabsDelegate.showBar(false);
			});
			$scope.$on("$ionicView.afterLeave", function() {
				if ($scope.showBar) {
					$ionicTabsDelegate.showBar(true);
				}
			});
		}
	])
	//新建收货人
	.controller('nowAddrCtrl', ["$scope", "$rootScope", "$stateParams", "$ionicHistory", "$ionicLoading", "$ionicPopup", "$ionicTabsDelegate", "$ionicNavBarDelegate", "$ionicSlideBoxDelegate", "$timeout", "Account",
		function($scope, $rootScope, $stateParams, $ionicHistory, $ionicLoading, $ionicPopup, $ionicTabsDelegate, $ionicNavBarDelegate, $ionicSlideBoxDelegate, $timeout, Account) {

			$scope.caconfig = {
				cardinal: 18,
				increment: 37.5,
				levelpg: { transform: "translate3d(18px, 0px, 0px) scale(1)" },
				_prov: null,
				_city: null,
				_area: null,
				showArea: ""
			}

			$scope.addr = {
				name: '',
				tel: '',
				provience: '',
				city: '',
				area: '',
				address: '',
				zipcode: '',
				isdefault: false
			}

			$scope.regexp = {
				phone: /^1[3|4|5|7|8][0-9]{9}$/
			}

			//是否正在选择收货地址
			$scope.chooseBack = "ws-choose-back-leave";
			$scope.chooseAddress = "ar-area-animate-leave";

			$scope.openContacts = function() {
				Account.chooseContact().then(function(contcat) {
					$scope.addr.name = contcat.displayName;
					if (contcat.phones.length == 0) {
						$rootScope.prompt("该联系人无手机号码");
					} else {
						$scope.addr.tel = contcat.phones[0];
					}
				});
			}

			/**
			 * 获取省市区
			 * @param  {[type]}   code  [父级编码]
			 * @param  {[type]}   level [追加数据到下一级别, 0:省, 1: 市 , 2: 县区]
			 * @param  {Function} next  [是否自动进入下级]
			 * @return {[type]}         [description]
			 */
			$scope.getarea = function(code, level, next) {
				var tl = (level == 0 ? '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>' : '<ion-spinner class="spinner-light" icon="ios"></ion-spinner>');
				$ionicLoading.show({
					template: tl,
					showBackdrop: false
				});
				Account.takeArea(code).then(function(data) {
					if (data) {
						switch (level) {
							case 0:
								$scope.caconfig._prov = data;
								break;
							case 1:
								$scope.caconfig._city = data;
								break;
							case 2:
								$scope.caconfig._area = data;
								break;
						}
						$ionicSlideBoxDelegate.update();
						if (next) {
							$timeout(function() {
								$ionicSlideBoxDelegate.next(300);
							}, 300);
						}
					}
				}, function(resp) {
					$rootScope.prompt("error");
				}).finally(function() {
					$ionicLoading.hide();
				});
			}


			$scope.choosedArea = function(item, forLevel) {
				switch (forLevel) {
					case 1:
						$scope.caconfig._city = null;
						$scope.caconfig._area = null;
						$scope.addr.city = "";
						$scope.addr.area = "";
						$scope.addr.provience = item.name;
						break;
					case 2:
						$scope.caconfig._area = null;
						$scope.addr.area = "";
						$scope.addr.city = item.name;
						break;
					default:
						$scope.addr.area = item.name;
						$scope.close();
						break;
				}
				if (forLevel > 0) {
					$scope.getarea(item.code, forLevel, true);
				}
			}

			$scope.areaSlideChange = function(inx) {
				$scope.switchChoosePanel(inx);
			}

			$scope.chooseAddr = function() {
				$scope.chooseBack = "ws-choose-back-enter";
				$scope.chooseAddress = "ar-area-animate-enter";
				$ionicNavBarDelegate.showBar(false);
				$ionicSlideBoxDelegate.update();
			}
			$scope.close = function() {
				$scope.chooseBack = "ws-choose-back-leave";
				$scope.chooseAddress = "ar-area-animate-leave";
				$ionicNavBarDelegate.showBar(true);
			}

			$scope._provience = function() {
				$ionicSlideBoxDelegate.slide(0, 300);
				$scope.switchChoosePanel(0);
			}

			$scope._city = function() {
				$ionicSlideBoxDelegate.slide(1, 300);
				$scope.switchChoosePanel(1);
			}

			$scope._area = function() {
				$ionicSlideBoxDelegate.slide(2, 300);
				$scope.switchChoosePanel(2);
			}

			$scope.switchChoosePanel = function(inx) {
				var aims = $scope.caconfig.cardinal + $scope.caconfig.increment * inx;
				$scope.caconfig.levelpg = { transform: "translate3d(" + aims + "px, 0px, 0px) scale(1)", "transition-duration": "300ms" };
			}

			$scope.subaddr = function() {
				$ionicLoading.show({
					template: '<ion-spinner icon="ios"></ion-spinner>',
					showBackdrop: false
				});

				Account.addressAction($scope.addr, $stateParams.action)
					.then(function(data) {
						if (data.state == "ok") {
							$ionicLoading.show({
								template: '<div style="background: rgba(0,0,0,0.6); width: 88px; border-radius: 6px; height: 40px; line-height: 40px;">' + data.reason + '</div>',
								showBackdrop: false
							});

							$timeout(function() {
								$ionicLoading.hide();
								$ionicHistory.goBack();
							}, 1500);
						} else {
							$rootScope.prompt(data.reason);
						}
					}, function() {
						$rootScope.prompt("error");
					});
			}

			$scope.$on("$ionicView.enter", function() {
				$scope.getarea(3527, 0, false);

			});
			$scope.$on("$ionicView.afterEnter", function() {
				$ionicTabsDelegate.showBar(false);
				if ($stateParams.action == "upd") {
					$scope.addr = angular.fromJson($stateParams.addr);
				}
			});
		}
	])
	//账户升级
	.controller('upgradeCtrl', ["$scope", "$rootScope", "$ionicPopup", "$ionicLoading", "$ionicTabsDelegate", "Setting", "Account", "Cart",
		function($scope, $rootScope, $ionicPopup, $ionicLoading, $ionicTabsDelegate, Setting, Account, Cart) {
		

		$scope.upgrade = function(arg) {
			if(arg.paywhy == 'bl' && parseFloat($scope.user.usermomoney) < Setting.bzamount) {
				Setting.prompt("账户余额不足");
			} else {
				$ionicLoading.show({
					template: '<div style="background: rgba(0,0,0,0.7); width: auto; padding: 0px 10px; border-radius: 6px; height: 40px; line-height: 40px;">正在发起支付</div>',
					showBackdrop: false
				});
				Account.upgrade(arg).then(function(data) {
					$ionicLoading.hide();
					if (!data.state || data.state == "ok") {
						Account.reload();
						switch (arg.paywhy) {
	                        case "al":
	                            $scope.alipay(data);
	                            break;
	                        case "wx":

	                            break;
	                        case "bl":
	                        	Setting.prompt(data.reason);
	                        	break;
	                    }
					} else {
						Setting.prompt(data.reason);
					}
				}, function(resp) {
					$ionicLoading.hide();
					Setting.prompt("error");
				});
			}
		}

		$scope.alipay = function(data) {
            if(ionic.Platform.isIOS()) {
            	Cart.alipay(data);
                $ionicPopup.confirm({
                    title: "付款成功了吗?",
                    cancelText: "失败",
                    cancelType: "button-outline",
                    okText: "成功",
                    okType: "button-assertive"
                }).then(function(res) {
                    if(res) {
                        $ionicLoading.show({
                            template: '<div style="background: rgba(0,0,0,0.6); width: 88px; border-radius: 6px; height: 40px; line-height: 40px;">请稍后..</div>',
                            showBackdrop: false
                        });
                        Cart.checkAliPayment("mbop_checkAliPayment", data.out_trade_no).then(function(data) {
                            if(data.state == "ok") {
                                Account.reload();
                            }
                            $rootScope.prompt(data.reason, 2000);
                        }, function() {
                            Setting.prompt("error");
                        });
                    }
                });
            } else {
                Cart.alipay(data).then(function(res) {
	            	if(res) {
	            		Account.reload();
	            	}
	            });
            }
		}

		$scope.$on("$ionicView.enter", function () {
			$scope.user = Account.getUser();
		});
		$scope.$on("$ionicView.beforeEnter", function() {
			$ionicTabsDelegate.showBar(false);
		});
		$scope.$on("$ionicView.afterLeave", function() {
			$ionicTabsDelegate.showBar(true);
		});
	}])
	//提现选择
	.controller('chooseCtrl', ["$scope", "$state", "$ionicTabsDelegate", function($scope, $state, $ionicTabsDelegate) {
		$scope.next = function(arg) {
				$scope.leaveShowbar = false;
				if (arg.choice == "bank") {
					$state.go("tab.account-apply-bank");
				} else {
					$state.go("tab.account-apply-alipay");
				}
			}
			//默认选中第一个
		$scope.data = {
			choice: "bank"
		}
		$scope.$on("$ionicView.beforeEnter", function() {
			$scope.leaveShowbar = true;
			$ionicTabsDelegate.showBar(false);
		});
		$scope.$on("$ionicView.afterLeave", function() {
			if($scope.leaveShowbar) {
				$ionicTabsDelegate.showBar(true);
			}
		});
	}])
	//银行卡提现
	.controller("bankCtrl", ["$scope", "$rootScope", "$state", "$ionicLoading", "$timeout", "$ionicPopup", "Account",
		function($scope, $rootScope, $state, $ionicLoading, $timeout, $ionicPopup, Account) {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
				showBackdrop: false
			});
			Account.getBalance().then(function(res) {
				if (res.state == "ok") {
					if (parseFloat(res.reason) < 100) {
						$rootScope.prompt("余额不足100, 无法提现");
					} else {
						$ionicLoading.hide();
					}
					$scope.balance = res.reason;
				}
			}, function(resp) {
				$rootScope.prompt("eroor")
			});

			Account.getBanks().then(function(res) {
				if (res.state == "ok") {
					$scope.banks = res.data;
				}
			}, function(resp) {
				$rootScope.prompt("eroor")
			});

			/**
			 * 银行卡提现
			 */
			$scope.other = {};
			$scope.other['withdraw.banktype'] = 0;
			$scope._withdraw = function(arg) {
				$ionicPopup.confirm({
					title: '提示',
					template: '确定提取余额吗？',
					cancelText: '取消',
					okText: '确定'
				}).then(function(res) {
					if (res) {
						$ionicLoading.show({
							template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						for (item in arg) {
							var pep = 'withdraw.' + item;
							$scope.other[[pep]] = arg[item];
						}
						Account.withdraw($scope.other).then(function(data) {
							$ionicLoading.hide();
							if (data.state == "ok") {
								Account.reload();
								$state.go("tab.account-apply-res");
							} else {
								$rootScope.prompt(data.reason);
							}
						}, function(resp) {
							$rootScope.prompt("error");
						});
					}
				})
			}
		}
	])
	//支付宝提现
	.controller("alipayCtrl", ["$scope", "$rootScope", "$state", "$ionicLoading", "$timeout", "$ionicPopup", "Account", 
		function($scope, $rootScope, $state, $ionicLoading, $timeout, $ionicPopup, Account) {
		$ionicLoading.show({
			template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
			showBackdrop: false
		});
		Account.getBalance().then(function(res) {
			if (res.state == "ok") {
				if (parseFloat(res.reason) < 100) {
					$rootScope.prompt("余额不足100, 无法提现");
				} else {
					$ionicLoading.hide();
				}
				$scope.balance = res.reason;
			}
		}, function(resp) {
			$rootScope.prompt("eroor")
		});

		$scope.other = {};
		$scope.other['withdraw.banktype'] = 1;
		$scope._withdraw = function(arg) {
			$ionicPopup.confirm({
				title: '提示',
				template: '确定提取余额吗？',
				cancelText: '取消',
				okText: '确定'
			}).then(function(res) {
				if (res) {
					$ionicLoading.show({
						template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
						showBackdrop: false
					});
					for (item in arg) {
						var pep = 'withdraw.' + item;
						$scope.other[[pep]] = arg[item];
					}
					Account.withdraw($scope.other).then(function(data) {
						$ionicLoading.hide();
						if (data.state == "ok") {
							Account.reload();
							$state.go("tab.account-apply-res");
						} else {
							$rootScope.prompt(data.reason);
						}
					}, function(resp) {
						$rootScope.prompt("error");
					});
				}
			})
		}
	}])
	//白积分列表
	.controller("whiteListCtrl", ["$scope", "$state", "$stateParams", "$rootScope", "$ionicLoading", "$ionicTabsDelegate", "Account", 
		function($scope, $state, $stateParams, $rootScope, $ionicLoading, $ionicTabsDelegate, Account) {

		$scope.sender = {
			jifentype: 'b',
			pageindex: 0
		}

		$scope.loadMore = function() {
			$scope.sender.pageindex++;
			Account.pointList($scope.sender).then(function(data) {
				if (data.length < 20) {
					$scope.moreDataCanBeLoaded = false;
				}
				$scope.items.push(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}

		$scope.doRefresh = function() {
			$stateParams.refresh = true;
			$scope.sender.pageindex = 1;
			$scope.moreDataCanBeLoaded = true;
			Account.pointList($scope.sender).then(function(data) {
				$scope.items = [];
				if (data.length < 20) {
					$scope.moreDataCanBeLoaded = false;
				}
				$scope.items.push(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
		}

		$scope.fd = function(date) {
			return date.split(' ')[0];
		}

		$scope.td = function(date) {
			return date.split(' ')[1].split('.')[0];
		}

		//充值白积分
		$scope._recharge = function() {
			$scope.leaveShowbar = false;
			//阻止在积分充值模块后退时积分详情重新加载
			$stateParams.refresh = false;
			$state.go("tab.point-white-recharge");
		}

		$scope.$on("$ionicView.beforeEnter", function() {
			//模块激活并且允许重新加载数据
			if ($stateParams.refresh) {
				$scope.sender.pageindex = 0;
				$scope.items = [];
				$scope.moreDataCanBeLoaded = true;
				$scope.loadMore();
			} else {
				//由于模块在第一次被激活时会缓存起来,进入充值模块前会禁止后退重新加载, 当再次激活模块时检查是否允许重新加载，如果不允许则恢复原有配置
				$stateParams.refresh = true;
			}
			$scope.leaveShowbar = true;
			$ionicTabsDelegate.showBar(false);

		});

		$scope.$on("$ionicView.afterLeave", function() {
			if($scope.leaveShowbar) {
				$ionicTabsDelegate.showBar(true);
			}
		});
	}])
	//白积分充值
	.controller("whiteRechargeCtrl", ["$scope", "$rootScope", "$state", "$ionicLoading", "$ionicNavBarDelegate", "$timeout", "Account", 
		function($scope, $rootScope, $state, $ionicLoading, $ionicNavBarDelegate, $timeout, Account) {

		$scope.white = {
			username: Account.getUser().username
		};

		//白积分充值
		$scope.whiteRechargePoint = function(arg) {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
				showBackdrop: false
			});
			var params = {
				number: arg.number,
				password: arg.password,
				username: arg.username
			};
			Account.whiteRechargePoint().then(function(data) {
				if (data.state == "ok") {
					Account.reload();
					$scope.white = {
						number: '',
						password: '',
						username: $scope.user.username
					};
					$ionicLoading.hide();
					$state.go("tab.proint-white-resuc");
				} else {
					$rootScope.prompt(data.reason);
				}
			}, function(resp) {
				$rootScope.prompt("error");
			})
		}
	}])
	//白积分充值成功
	.controller("whiteResucCtrl", ["$scope", "$ionicHistory", function($scope, $ionicHistory) {
		$scope._back = function() {
			$ionicHistory.goBack();
		}
	}])
	//红积分列表
	.controller("redListCtrl", ["$scope", "$rootScope", "$state", "$stateParams", "$ionicLoading", "$ionicTabsDelegate", "$timeout", "Account", 
		function($scope, $rootScope, $state, $stateParams, $ionicLoading, $ionicTabsDelegate, $timeout, Account) {
		$scope.sender = {
			jifentype: 'h',
			pageindex: 0
		}

		$scope.loadMore = function() {
			$scope.sender.pageindex++;
			Account.pointList($scope.sender).then(function(data) {
				if (data.length < 20) {
					$scope.moreDataCanBeLoaded = false;
				}
				$scope.items.push(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}

		$scope.fd = function(date) {
			return date.split(' ')[0];
		}

		$scope.td = function(date) {
			return date.split(' ')[1].split('.')[0];
		}

		$scope.doRefresh = function() {
			$stateParams.refresh = true;
			$scope.sender.pageindex = 1;
			$scope.moreDataCanBeLoaded = true;
			Account.pointList($scope.sender).then(function(data) {
				$scope.items = [];
				if (data.length < 20) {
					$scope.moreDataCanBeLoaded = false;
				}
				$scope.items.push(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
		}

		//红积分兑换
		$scope.cashhub = function() {
			$scope.leaveShowbar = false;
			//阻止在积分充值模块后退时积分详情重新加载
			$stateParams.refresh = false;
			$state.go("tab.point-red-exchange");
		}

		$scope.$on("$ionicView.beforeEnter", function() {
			//模块激活并且允许重新加载数据
			if ($stateParams.refresh) {
				$scope.sender.pageindex = 0;
				$scope.items = [];
				$scope.moreDataCanBeLoaded = true;
				$scope.loadMore();
			} else {
				//由于模块在第一次被激活时会缓存起来,进入红积分兑换模块前会禁止后退重新加载, 当再次激活模块时检查是否允许重新加载，如果不允许则恢复原有配置
				$stateParams.refresh = true;
			}
			$scope.leaveShowbar = true;
			$ionicTabsDelegate.showBar(false);
		});

		$scope.$on("$ionicView.afterLeave", function() {
			if($scope.leaveShowbar) {
				$ionicTabsDelegate.showBar(true);
			}
		});
	}])
	//红积分兑换
	.controller("redExchangeCtrl", ["$scope", "$rootScope", "$state", "$ionicLoading", "$timeout", "Account", 
		function($scope, $rootScope, $state, $ionicLoading, $timeout, Account) {
		$scope.redresidue = Account.getUser().userhongjifen;

		$scope.exchangeRedPoint = function(arg) {
			$ionicLoading.show({
				template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
				showBackdrop: false
			});
			var params = {
				'rpt_num': arg.rpt_num
			}
			Account.exchangeRedPoint(params).then(function(data) {
				if (data.state == "ok") {
					Account.reload();
					$ionicLoading.hide();
					$state.go("tab.point-red-resuc");
				} else {
					$rootScope.prompt(data.reason);
				}
			}, function() {
				$rootScope.prompt("error");
			})
		}
	}])
	//资金明细
	.controller("assetsCtrl", ["$scope", "$ionicLoading", "$ionicTabsDelegate", "Account", function($scope, $ionicLoading, $ionicTabsDelegate, Account) {
		$scope.params = {
			pageindex: 0
		};
		$scope.items = [];
		$scope.moreDataCanBeLoaded = true;

		$scope.loadMore = function() {
			$scope.params.pageindex++;
			Account.assetsList($scope.params).then(function(data) {
				if (data.length < 20) {
					$scope.moreDataCanBeLoaded = false;
				}
				$scope.items.push(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}

		$scope.fd = function(date) {
			return date.split(' ')[0];
		}

		$scope.td = function(date) {
			return date.split(' ')[1].split('.')[0];
		}

		$scope.doRefresh = function() {
			$scope.params.pageindex = 0;
			$scope.moreDataCanBeLoaded = true;
			Account.assetsList($scope.params).then(function(data) {
				$scope.items = [];
				if (data.length < 20) {
					$scope.moreDataCanBeLoaded = false;
				}
				$scope.items.push(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');

			}).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
		}

		$scope.$on("$ionicView.beforeEnter", function() {
			$scope.params.pageindex = 0;
			$scope.items = [];
			$scope.moreDataCanBeLoaded = true;
			$scope.loadMore();
			$ionicTabsDelegate.showBar(false);
		})

		$scope.$on("$ionicView.afterLeave", function() {
			$ionicTabsDelegate.showBar(true);
		});
	}])
	.controller("childCtrl", ["$scope", "$ionicLoading", "$ionicTabsDelegate", "Account", function($scope, $ionicLoading, $ionicTabsDelegate, Account) {
		$scope.items = [];
		$scope.params = {
			pageindex: 0
		}
		$scope.moreDataCanBeLoaded = true;

		$scope.loadMore = function() {
			$scope.params.pageindex++;
			Account.mychilds($scope.params).then(function(data) {
				if (data.length < 20) {
					$scope.moreDataCanBeLoaded = false;
				}
				$scope.items.push(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			})
		}

		$scope.doRefresh = function() {
			$scope.params.pageindex = 1;
			$scope.moreDataCanBeLoaded = true;
			Account.mychilds($scope.params).then(function(data) {
				if (data.length < 20) {
					$scope.moreDataCanBeLoaded = false;
				}
				$scope.items.push(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
		}

		$scope.$on("$ionicView.beforeEnter", function() {
			$scope.items = [];
			$scope.params.pageindex = 0;
			$scope.moreDataCanBeLoaded = true;
			$scope.loadMore();
		});

		$scope.$on("$ionicView.beforeEnter", function() {
			$ionicTabsDelegate.showBar(false);
		});
		$scope.$on("$ionicView.afterLeave", function() {
			$ionicTabsDelegate.showBar(true);
		});
	}])
	.controller("codeCtrl", ["$scope", "$ionicTabsDelegate", "Account", function($scope, $ionicTabsDelegate, Account) {
		$scope.qrcodeUrl = "http://117.34.70.172/uploadimages/yunhuitianxia/" + Account.getUser().userid + ".jpg";

		$scope.$on("$ionicView.beforeEnter", function() {
			$ionicTabsDelegate.showBar(false);
		});
		$scope.$on("$ionicView.afterLeave", function() {
			$ionicTabsDelegate.showBar(true);
		});
	}])
	.controller('myorderCtrl', ['$scope', '$rootScope', '$timeout', '$window', '$ionicTabsDelegate', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', '$ionicLoading', '$ionicPopup', 'Account', 'Cart',
		function($scope, $rootScope, $timeout, $window, $ionicTabsDelegate, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicLoading, $ionicPopup, Account, Cart) {
			$scope.curLev = 0;
			$scope.curActive = undefined;
			$scope.myOrders = {
				//全部
				all: {
					//当前加载页面索引
					curInx: 1,
					//是否有更多数据, 当加载数据条数大于10则继续加载, 默认为禁止页面主动加载, 首次进入由程序加载数据
					allowLoadMore: false,
					//存储订单数据
					os: new Array(),
					//当点击订单分类时是否自动加载数据,首次进入时主动加载
					autoLoad: true,
					//是否由页面检测加载数据
					formPageLoad: false,
				},
				//待付款
				waitPay: {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				},
				//待收货
				waitTake: {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				},
				//已完成
				complate: {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			}


			/**
			 * 切换订单面板
			 * @param  {[type]} inx [description]
			 * @return {[type]}     [description]
			 */
			$scope.switchPanel = function(inx) {
				$ionicSlideBoxDelegate.slide(inx, 300);
				var to = $window.innerWidth * ((25 * inx) / 100);
				$scope.curLev = inx;
				$scope.switchWhere = { transform: "translate3d(" + to + "px, 0px, 0px) scale(1)", "transition-duration": "300ms" };
				switch (inx) {
					case 0:
						$scope.curActive = $scope.myOrders.all;
						break;
					case 1:
						$scope.curActive = $scope.myOrders.waitPay;
						break;
					case 2:
						$scope.curActive = $scope.myOrders.waitTake;
						break;
					case 3:
						$scope.curActive = $scope.myOrders.complate;
						break;
				}
				if (!($scope.curActive && $scope.curActive.autoLoad)) {
					return false;
				} else {
					$ionicLoading.show({
						template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
						showBackdrop: false
					});
				}
				$scope.loadMore($scope.curLev, true);
			}

			$scope.loadMore = function(lev, allowLoad) {
				if (!allowLoad) {
					return false;
				}

				Account.getOrder(lev, $scope.curActive.curInx)
					.then(function(data) {
						switch (lev) {
							case 0:
								$scope.handleAll(data);
								break;
							case 1:
								$scope.handleWaitPay(data);
								break;
							case 2:
								$scope.handleWaitTake(data);
								break;
							case 3:
								$scope.handleComplate(data);
								break;
						}
						$ionicLoading.hide();
					}, function(resp) {

					})
			};

			$scope.handleAll = function(data) {
				if (data.data.length < 10) {
					$scope.myOrders.all.allowLoadMore = false;
				} else {
					$scope.myOrders.all.allowLoadMore = true;
				}
				$scope.myOrders.all.os = $scope.myOrders.all.os.concat(data.data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.myOrders.all.curInx++;
				$scope.myOrders.all.formPageLoad = true;
				$scope.myOrders.all.autoLoad = false;
				console.log(data);
			}

			$scope.handleWaitPay = function(data) {
				if (data.data.length < 10) {
					$scope.myOrders.waitPay.allowLoadMore = false;
				} else {
					$scope.myOrders.waitPay.allowLoadMore = true;
				}
				$scope.myOrders.waitPay.os = $scope.myOrders.waitPay.os.concat(data.data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.myOrders.waitPay.curInx++;
				$scope.myOrders.waitPay.formPageLoad = true;
				$scope.myOrders.waitPay.autoLoad = false;
				console.log(data);
			}

			$scope.handleWaitTake = function(data) {
				if (data.data.length < 10) {
					$scope.myOrders.waitTake.allowLoadMore = false;
				} else {
					$scope.myOrders.waitTake.allowLoadMore = true;
				}
				$scope.myOrders.waitTake.os = $scope.myOrders.waitTake.os.concat(data.data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.myOrders.waitTake.curInx++;
				$scope.myOrders.waitTake.formPageLoad = true;
				$scope.myOrders.waitTake.autoLoad = false;
				console.log(data);
			}

			$scope.handleComplate = function(data) {
				if (data.data.length < 10) {
					$scope.myOrders.complate.allowLoadMore = false;
				} else {
					$scope.myOrders.complate.allowLoadMore = true;
				}
				$scope.myOrders.complate.os = $scope.myOrders.complate.os.concat(data.data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.myOrders.complate.curInx++;
				$scope.myOrders.complate.formPageLoad = true;
				$scope.myOrders.complate.autoLoad = false;
				console.log(data);
			}

			/**
			 * [支付]
			 * @param  {[type]} data [description]
			 * @return {[type]}      [description]
			 */
			$scope.readyBuy = function(data) {
				//初始化支付
				Cart.readyBuy($scope, "mbop_checkAliPayment").then(function() {
					//数据订单数据
					var other = Cart.handleMyOrdersPd($scope, data);
					//调用支付
					$scope.buy(other._data, other.total, data.ordernumber).then(function(res) {
						//支付结果
						if(res) {
							$scope.reset_all();
							$scope.reset_waitPay();
							$scope.reset_waitTake();
							$scope.switchPanel($scope.curLev);
							$ionicScrollDelegate.resize();
							$ionicLoading.show({
								template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
								showBackdrop: false
							});
						}
					});
				});
			}

			$scope.reset_all = function() {
				$scope.myOrders.all = {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			}
			$scope.reset_waitPay = function() {
				$scope.myOrders.waitPay = {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			}
			$scope.reset_waitTake = function() {
				$scope.myOrders.waitTake = {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			}
			$scope.reset_complate = function() {
				$scope.myOrders.complate = {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			}



			/**
			 * 删除订单
			 * @param  {[type]} order_num [订单编号]
			 * @param  {[type]} inx       [订单索引]
			 * @return {[type]}           [description]
			 */
			$scope.delOrder = function(order_num, inx) {
				$ionicPopup.confirm({
					title: '确定删除吗?',
					cancelText: "取消",
					cancelType: "button-light",
					okText: "确定",
					okType: "button-assertive"
				}).then(function(res) {
					if (res) {
						$ionicLoading.show({
							template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						Cart.delOrder(order_num).then(function(res) {
							if (res) {
								switch ($scope.curLev) {
									case 0:
										$scope.reset_waitPay();
										$scope.reset_complate();
										$scope.myOrders.all.os.splice(inx, 1);
										break;
									case 1:
										$scope.reset_all();
										$scope.reset_complate();
										$scope.myOrders.waitPay.os.splice(inx, 1);
										break;
									case 3:
										$scope.reset_all();
										$scope.reset_waitPay();
										$scope.myOrders.complate.os.splice(inx, 1);
										break;
								}
							}
							$ionicScrollDelegate.resize();
							$ionicLoading.hide();
						});
					}
				});
			}

			/**
			 * [收货]
			 * @param  {[type]} order_num [订单编号]
			 * @param  {[type]} opd_id    [订单商品ID]
			 * @return {[type]}           [description]
			 */
			$scope.takePd = function(order_id, opd_id) {

				var handleTakePd = function(data) {
					angular.forEach(data, function(sen, inx) {
						if (sen.id == order_id) {
							angular.forEach(sen.producrs, function(pdSen, pdInx) {
								if (pdSen.id == opd_id) {
									sen.producrs.splice(pdInx, 1);
									return false;
								}
							})
							if (sen.producrs.length == 0) {
								data.splice(inx, 1);
							}
							return false;
						}
					})
				}

				$ionicPopup.confirm({
					title: '确定收货吗?',
					cancelText: "取消",
					cancelType: "button-light",
					okText: "确定",
					okType: "button-assertive"
				}).then(function(res) {
					if (res) {
						$ionicLoading.show({
							template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						Cart.takePd(order_id, opd_id).then(function(result) {
							if (result) {
								switch ($scope.curLev) {
									case 0:
										handleTakePd($scope.myOrders.all.os);
										$scope.reset_waitTake();
										$scope.reset_complate();
										break;
									case 2:
										handleTakePd($scope.myOrders.waitTake.os);
										$scope.reset_all();
										$scope.reset_complate();
										break;
								}
								$ionicScrollDelegate.resize();
								$ionicLoading.hide();
							}
						});
					}
				});
			}

			$scope.$on("$ionicView.enter", function() {
				$scope.scroll = {
					height: $window.innerHeight - (36 + 44) + "px"
				}
				$scope.reset_all();
				$scope.reset_waitPay();
				$scope.reset_waitTake();
				$scope.reset_complate();
				$scope.switchPanel($scope.curLev);
				$ionicSlideBoxDelegate.enableSlide(false);
				$ionicTabsDelegate.showBar(false);
			});
			$scope.$on("$ionicView.beforeLeave", function() {
				$ionicTabsDelegate.showBar(true);
			});
		}
	]);
