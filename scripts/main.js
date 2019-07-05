geotab.addin.authoritySwitcher = function(api, state) {
		let	addNew = document.getElementById("addAuth"),
			saveChanges = document.getElementById("saveEdit"),
			deleteAuth = document.getElementById("clear"),
			helpButton = document.getElementById("authHelpButton"),
			authorityDropDown = document.getElementById("import-authorities"),
			groupsSelectBox = document.getElementById("import-groups"),
			newSelectBox = document.getElementById("newGroups"),
			companyName = document.getElementById("companyName"),
			companyAddress = document.getElementById("companyAddress"),
			authorityName = document.getElementById("authorityName"),
			authorityAddress = document.getElementById("authorityAddress"),
			carrierNumber = document.getElementById("carrierNumber"),
			companyNameNew = document.getElementById("companyNameNew"),
			companyAddressNew = document.getElementById("companyAddressNew"),
			authorityNameNew = document.getElementById("authorityNameNew"),
			authorityAddressNew = document.getElementById("authorityAddressNew"),
			carrierNumberNew = document.getElementById("carrierNumberNew"),
			addInDataCache = {},
			id = "aMO4bMooow0KlW2WdaT2suw",
			selected = "",
			addingnew = true,
			groupCache = {},
			groupsSelected = [],
			newTab = document.getElementById("newTab"),
			editTab = document.getElementById("editTab"),
			newMenu = document.getElementById("primaryTab"),
			editMenu = document.getElementById("secondaryTab"),
			alertError = document.getElementById("alertError"),
			errorMessageTimer,
			
			init = function() {
				checkUserClearance().then(function(approved) {
					if (approved) {
						grabGroups().then(function(rawGroupObj) {
							populateSelectBox(rawGroupObj, true);
							grabAddInData().then(function(rawAddInObj) {
								populateForm(rawAddInObj);
							});
						});
					} else {
						document.getElementById("authoritySwitcherTabs").style.display = "none";
						helpButton.style.display = "none";
						addNew.disabled = true;
						errorHandler("Administrator Clearance is required to use this add-in.")
					}
				});
				
			},
			isEmpty = function(obj) {
				for (let prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						return false;
					};
				};
				return JSON.stringify(obj) === JSON.stringify({});
			},
			checkUserClearance = function() {
				return new Promise(function(resolve, reject) {
					api.getSession(function(credentials) {
						resolve(grabUsers(credentials.userName));
					});
				});
			},
			grabUsers = function(name) {
				return new Promise(function(resolve, reject) {
					api.call("Get", {
						typeName: "User",
						search: {
							"name": name
						}
					}, function(result) {
						if (result[0].securityGroups[0].id === "GroupEverythingSecurityId") {
							resolve(true);
						} else {
							resolve(false);
						};
					});
				});
			},
			grabGroups = function() {
				return new Promise(function(resolve, reject) {
					api.call("Get", {
						typeName: "Group"
					}, function(result) {
						resolve(result);
					}, function(error) {
						reject(error);
					});	
				});
			},
			grabAddInData = function() {
				return new Promise(function(resolve, reject) {
					api.call("Get", {"typeName": "AddInData",
						"search": {
							"addInId": "aMO4bMooow0KlW2WdaT2suw"
						}
					}, function (addInObj) {
						if (addInObj.length > 0) {
							addInDataCache = JSON.parse(addInObj[0].data);
							resolve(addInObj);
						} else {
							resolve(addInObj);
						};
					}, function (error) {
						reject(error);
					});
				});
			},
			errorHandler = function(msg) {
				alertError.textContent = msg;
				alertError.classList.remove("hidden");
				clearTimeout(errorMessageTimer);
				errorMessageTimer = setTimeout(() => {
					alertError.classList.add("hidden");
				}, 5000);
			},
			populateForm = function (addInPayload) {
				let groupsList = document.getElementById("groups_selected"),
					authorityList = document.getElementById("import-authorities"),
					groupNames = [];
				if (!isEmpty(addInDataCache)) {
					let authorities = addInDataCache.authorities;
					console.log(authorities);
					
					authorities.sort(function(a, b) {
						if (a.authorityName.toLowerCase() < b.authorityName.toLowerCase()) {
							return -1;
						}
						if (a.authorityName.toLowerCase() > b.authorityName.toLowerCase()) {
							return 1;
						}
						return 0;
					});
					
					for (let i = 0; i < authorities.length; i++) {
						let authorityOption = new Option();
						authorityOption.text = authorities[i].authorityName;
						authorityOption.value = authorities[i].authorityName;
						companyName.value = authorities[0].companyName;
						companyAddress.value = authorities[0].companyAddress;
						selected = authorities[0].authorityName;
						authorityName.value = authorities[0].authorityName;
						authorityAddress.value = authorities[0].authorityAddress;
						carrierNumber.value = authorities[0].carrierNumber;
						authorityList.add(authorityOption);
					}	
					for (let j = 0; j < authorities[0].groups.length; j++) {
						console.log(authorities[0].groups[j]);
						groupNames.push(groupCache[authorities[0].groups[j]]);
					}
					console.log(groupNames);
					groupsList.innerHTML = groupNames;
				}
				else {
					companyName.value = "Please enter New Authority";
					companyName.disabled = true;

					companyAddress.value = "Please enter New Authority";
					companyAddress.disabled = true;

					authorityName.value = "Please enter New Authority";
					authorityName.disabled = true;

					authorityAddress.value = "Please enter New Authority";
					authorityAddress.disabled = true;

					carrierNumber.value = "Please enter New Authority";
					carrierNumber.disabled = true;
				}
			},
			populateSelectBox = function(groupsData, newAuthority) {
				if (newAuthority) {
					let groupNewSelect = document.getElementById("newGroups");
					for (let i = 0; i < groupsData.length; i++) {
						if (groupsData[i].name === undefined) {
							groupsData[i].name = groupsData[i].id;
						}
					}
				
					if (groupsData && groupsData != null && groupsData.length > 0) {
						groupsData.sort(function(a, b) {
							if(a.name.toLowerCase() < b.name.toLowerCase()) {
								return -1;
							}
							if (a.name.toLowerCase() > b.name.toLowerCase()) {
								return 1;
							}
							return 0;
						});
						for (let groupIndex = 0; groupIndex < groupsData.length; groupIndex++) {
							if (groupsData[groupIndex] !== "GroupCompanyId") {
								let groupOption = new Option();
								groupOption.text = groupsData[groupIndex].name;
								groupOption.value = groupsData[groupIndex].id;							
								groupNewSelect.add(groupOption);		
								groupCache[groupsData[groupIndex].id] = groupsData[groupIndex].name;
							}
						}
					}
				} else {
					let groupEditSelect = document.getElementById("import-groups");
					for (let i = 0; i < groupsData.length; i++) {
						if (groupsData[i].name === undefined) {
							groupsData[i].name = groupsData[i].id;
						}
					}
					
					if (groupsData && groupsData != null && groupsData.length > 0) {
						groupsData.sort(function(a, b) {
							if(a.name.toLowerCase() < b.name.toLowerCase()) {
								return -1;
							}
							if (a.name.toLowerCase() > b.name.toLowerCase()) {
								return 1;
							}
							return 0;
						});
						for (let groupIndex = 0; groupIndex < groupsData.length; groupIndex++) {
							if (groupsData[groupIndex] !== "GroupCompanyId") {
								let groupOption = new Option();
								groupOption.text = groupsData[groupIndex].name;
								groupOption.value = groupsData[groupIndex].id;							
								groupEditSelect.add(groupOption);		
								groupCache[groupsData[groupIndex].id] = groupsData[groupIndex].name;
							}
						}
					}
				}		
			},
			getSelectValues = function(selectedGroups) {
				let result = [],
					options = selectedGroups && selectedGroups.options;

				for (let i = 0; i < options.length; i++) {
					let opt = options[i];

					if (opt.selected) {
						result.push(opt.value || opt.text);
					}
				}
				return result;
			},
			makeActive = function(tab, menu) {
				tab.classList.add("activeTab");
				menu.style.display = "block";
			},
			makeInActive = function(tab, menu) {
				tab.classList.remove("activeTab", "active");
				menu.style.display = "none";

			};
			newTab.addEventListener("click", function() {
				makeActive(newTab, newMenu);				
				makeInActive(editTab, editMenu);
				addNew.style.display = "block";
				saveChanges.style.display = "none";
				deleteAuth.style.display = "none";
				grabGroups().then(function(rawGroupObj) {
					populateSelectBox(rawGroupObj, true);
					addingnew = true;
				});
			});
			editTab.addEventListener("click", function() { 
				makeActive(editTab, editMenu);
				makeInActive(newTab, newMenu);
				addNew.style.display = "none";
				saveChanges.style.display = "inline-block";
				deleteAuth.style.display = "inline-block";
				grabGroups().then(function(rawGroupObj) {
					populateSelectBox(rawGroupObj, false);
					addingnew = false;
				});				
			});
		
		let modifyAuthorityInfo = function(clearAuth) {
			
			let groups = [];
			
			grabAddInData().then(function(addInObj) {
				let tempObj = addInObj.length ? JSON.parse(addInObj[0].data) : {};
				
				for (let i = 0; i < groupsSelected.length; i++){
					groups.push({
						id: groupsSelected[i]
					});
					console.log(groups);
				}
				if (addInObj.length > 0) {
					let authorityObj,
						emptyAuth = false;
					if (addingnew) {
						authorityObj = {
							"companyName": companyNameNew.value,
							"companyAddress": companyAddressNew.value,
							"authorityName": authorityNameNew.value,
							"authorityAddress": authorityAddressNew.value,
							"carrierNumber": carrierNumberNew.value,
							"groups": groupsSelected
						};
						for (let key in authorityObj) {
							if (!authorityObj[key]) {
								emptyAuth = true;
								break;
							}
						}
						tempObj.authorities.push(authorityObj);
						addInDataCache.authorities.push(authorityObj);
					} else {
						authorityObj = {
							"companyName": companyName.value,
							"companyAddress": companyAddress.value,
							"authorityName": authorityName.value,
							"authorityAddress": authorityAddress.value,
							"carrierNumber": carrierNumber.value,
							"groups": groupsSelected
						};
						for (let auth in tempObj.authorities) {
							if (tempObj.authorities[auth].authorityName == selected) {
								tempObj.authorities[auth] = authorityObj;
							}
						}	
					}
					
					
					addInObj[0].data = JSON.stringify(tempObj);
					addInObj[0].groups = [{"id":"GroupCompanyId"}];
					if ((groups.length > 0) && !emptyAuth ) {
						api.call("Set", {"typeName": "AddInData",
							"entity": addInObj[0]
						}, function() {
							window.location.reload(false);
						});
					} else {
						if (!addingnew) {
							alert("Please select at least one group!");
						}
						else {
							alert("You are missing one or more fields!");
						}
					}
				}
				else {
					api.call("Add", {
						"typeName": "AddInData",
						"entity": {
							"addInId": id,
							"groups": groups,
							"data": JSON.stringify({
								"authorities": [{
									"authorityName": authorityNameNew.value,
									"authorityAddress": authorityAddressNew.value,
									"companyName": companyNameNew.value,
									"companyAddress": companyAddressNew.value,
									"carrierNumber": carrierNumberNew.value,
									"groups": groupsSelected
								}]
							})
						}
					}, function(results) {
						window.location.reload(false);

					});
				}		
			});
		},


		//For deleting the current authority displayed
		clearInfo = function() {
			grabAddInData().then(function(tempData) {
				console.log(tempData);
				let tempAuthList,
					removeAddInData;
				
				if (tempData.length == 0) {
					removeAddInData = false;
				} else {
					tempAuthList = JSON.parse(tempData[0].data);
					if (tempAuthList.authorities.length == 1) {
						removeAddInData = true;
					}
					for (let i = 0; i < tempAuthList.authorities.length; i++) {
						if (tempAuthList.authorities[i].authorityName == selected) {
							tempAuthList.authorities.splice(i,1);
						}
					}
					tempData[0].data = JSON.stringify(tempAuthList);
				}

				
				
				if (removeAddInData) {
					api.call("Remove", {"typeName": "AddInData",
						"entity": {
							"id": tempData[0].id,
							"addInId": id
						}
					}, function(result) {
						window.location.reload(false);
					});
				} else {
					console.log("No authority to delete");
					window.location.reload(false);
					/* api.call("Set", {
						"typeName": "AddInData",
						"entity": tempData[0]
					}, function (result) {
						window.location.reload(false);
					}); */
				}
			});
		};
		// Simple Dialog Box Plugin by Taufik Nurrohman
		// URL: http://www.dte.web.id + https://plus.google.com/108949996304093815163/about
		// Licence: none

		(function(a, b) {

			var uniqueId = new Date().getTime();

			(function() { // Create the dialog box markup
				var div = b.createElement('div'),
					ovr = b.createElement('div');
					div.className = 'dialog-box-auth';
					div.id = 'dialog-box-auth-' + uniqueId;
					div.innerHTML = '<div class="dialog-title">&nbsp;</div><a href="javascript:;" class="dialog-minmax" title="Minimize">&ndash;</a><a href="javascript:;" class="dialog-close" title="Close">&times;</a><div class="dialog-content">&nbsp;</div><div class="dialog-action"></div>';
					ovr.className = 'dialog-box-auth-overlay';
				b.body.appendChild(div);
				b.body.appendChild(ovr);
			})();

			var maximize = false,
				dialog = b.getElementById('dialog-box-auth-' + uniqueId), // The HTML of dialog box
				dialog_title = dialog.children[0],
				dialog_minmax = dialog.children[1],
				dialog_close = dialog.children[2],
				dialog_content = dialog.children[3],
				dialog_action = dialog.children[4],
				dialog_overlay = dialog.nextSibling;

			a.setDialog = function(set, config) {

				var selected = null, // Object of the element to be moved
					x_pos = 0,
					y_pos = 0, // Stores x & y coordinates of the mouse pointer
					x_elem = 0,
					y_elem = 0, // Stores top, left values (edge) of the element
					defaults = {
						title: dialog_title.innerHTML,
						content: dialog_content.innerHTML,
						width: 300,
						height: 150,
						top: false,
						left: false,
						buttons: {
							"Yes": function() {
								clearInfo();
							},
							"Cancel": function() {
								setDialog('close');
							}
						},
						specialClass: "",
						fixed: false,
						overlay: true
					}; // Default options...

				for (var i in config) { defaults[i] = (typeof(config[i])) ? config[i] : defaults[i]; }

				// Will be called when user starts dragging an element
				function _drag_init(elem) {
					selected = elem; // Store the object of the element which needs to be moved
					x_elem = x_pos - selected.offsetLeft;
					y_elem = y_pos - selected.offsetTop;
				}

				// Will be called when user dragging an element
				function _move_elem(e) {
					x_pos = b.all ? a.event.clientX : e.pageX;
					y_pos = b.all ? a.event.clientY : e.pageY;
					if (selected !== null) {
						selected.style.left = !defaults.left ? ((x_pos - x_elem) + selected.offsetWidth/2) + 'px' : ((x_pos - x_elem) - defaults.left) + 'px';
						selected.style.top = !defaults.top ? ((y_pos - y_elem) + selected.offsetHeight/2) + 'px' : ((y_pos - y_elem) - defaults.top) + 'px';
					}
				}

				// Destroy the object when we are done
				function _destroy() {
					selected = null;
				}

				dialog.className =  "dialog-box-auth " + (defaults.fixed ? 'fixed-dialog-box ' : '') + defaults.specialClass;
				dialog.style.visibility = (set === "open") ? "visible" : "hidden";
				dialog.style.opacity = (set === "open") ? 1 : 0;
				dialog.style.width = defaults.width + 'px';
				dialog.style.height = defaults.height + 'px';
				dialog.style.top = (!defaults.top) ? "50%" : '0px';
				dialog.style.left = (!defaults.left) ? "50%" : '0px';
				dialog.style.marginTop = (!defaults.top) ? '-' + defaults.height/2 + 'px' : defaults.top + 'px';
				dialog.style.marginLeft = (!defaults.left) ? '-' + defaults.width/2 + 'px' : defaults.left + 'px';
				dialog_title.innerHTML = defaults.title;
				dialog_content.innerHTML = defaults.content;
				dialog_action.innerHTML = "";
				dialog_overlay.style.display = (set === "open" && defaults.overlay) ? "block" : "none";

				if (defaults.buttons) {
					for (var j in defaults.buttons) {
						var btn = b.createElement('a');
							btn.className = 'btn';
							btn.href = 'javascript:;';
							btn.innerHTML = j;
							btn.onclick = defaults.buttons[j];
						dialog_action.appendChild(btn);
					}
				} else {
					dialog_action.innerHTML = '&nbsp;';
				}

				// Bind the draggable function here...
				dialog_title.onmousedown = function() {
					_drag_init(this.parentNode);
					return false;
				};

				dialog_minmax.innerHTML = '&ndash;';
				dialog_minmax.title = 'Minimize';
				dialog_minmax.onclick = dialogMinMax;

				dialog_close.onclick = function() {
					setDialog("close", {content:""});
				};

				b.onmousemove = _move_elem;
				b.onmouseup = _destroy;

				maximize = (set === "open") ? true : false;

			};

			// Maximized or minimized dialog box
			function dialogMinMax() {
				if (maximize) {
					dialog.className += ' minimize';
					dialog_minmax.innerHTML = '+';
					dialog_minmax.title = dialog_title.innerHTML.replace(/<.*?>/g,"");
					maximize = false;
				} else {
					dialog.className = dialog.className.replace(/(^| )minimize($| )/g, "");
					dialog_minmax.innerHTML = '&ndash;';
					dialog_minmax.title = 'Minimize';
					maximize = true;
				}
			}

		})(window, document);
		return {
			/**
			 * initialize() is called only once when the Add-In is first loaded. Use this function to initialize the
			 * Add-In's state such as default values or make API requests (MyGeotab or external) to ensure interface
			 * is ready for the user.
			 * @param {object} api - The GeotabApi object for making calls to MyGeotab.
			 * @param {object} state - The page state object allows access to URL, page navigation and global group filter.
			 * @param {function} addInReady - Call this when your initialize route is complete. Since your initialize routine
			 *        might be doing asynchronous operations, you must call this method when the Add-In is ready
			 *        for display to the user.
			 */
			initialize: function(api, state, addInReady) {
				// MUST call addInReady when done any setup
				addNew.addEventListener("click", function() {
					modifyAuthorityInfo(false);
				}, false);

				saveChanges.addEventListener("click", function() {
					modifyAuthorityInfo(false);
				}, false);

				clear.addEventListener("click", function() {
					setDialog("open", {
						title: "Confirmation",
						content: "Are you sure you would like to delete this authority?"
					});
				}, false);
				
				helpButton.addEventListener("click", function() {
					setDialog("open", {
						title: "Help",
						content: "This page allows you to configure authorities for your drivers to switch to in the Geotab Drive App. Please enter all appropriate fields and select the desired groups to save an authority configuration to your database.",
						buttons: {
							"Close": function() {
								setDialog('close');
							}
						}
					})
				}, false);
				
				authorityDropDown.addEventListener("change", function() {
					console.log(this.value);
					if (this.value) {
						selected = this.value;
						for (var i = 0; i < addInDataCache.authorities.length; i++) {
							if (addInDataCache.authorities[i].authorityName == selected) {
								let groupNames = [];
								let groupsList = document.getElementById("groups_selected");
								companyName.value = addInDataCache.authorities[i].companyName;
								companyAddress.value = addInDataCache.authorities[i].companyAddress;
								authorityName.value = addInDataCache.authorities[i].authorityName;
								authorityAddress.value = addInDataCache.authorities[i].authorityAddress;
								carrierNumber.value = addInDataCache.authorities[i].carrierNumber;
								for (let j = 0; j < addInDataCache.authorities[i].groups.length; j++) {
									console.log(addInDataCache.authorities[i].groups[j]);
									groupNames.push(groupCache[addInDataCache.authorities[i].groups[j]]);
								}
								console.log(groupNames);
								groupsList.innerHTML = groupNames;
							}
						}
					}
				});
				
				newSelectBox.addEventListener("change", function(event) {
					let selectedNewGroups = event.target;
					groupsSelected = getSelectValues(selectedNewGroups);
				});
				
				groupsSelectBox.addEventListener("change", function(event) {
					let selectedEditGroups = event.target;
					groupsSelected = getSelectValues(selectedEditGroups);
				});
				

				
				init();
				addInReady();
			},

			/**
			 * focus() is called whenever the Add-In receives focus.
			 *
			 * The first time the user clicks on the Add-In menu, initialize() will be called and when completed, focus().
			 * focus() will be called again when the Add-In is revisited. Note that focus() will also be called whenever
			 * the global state of the MyGeotab application changes, for example, if the user changes the global group
			 * filter in the UI.
			 *
			 * @param {object} api - The GeotabApi object for making calls to MyGeotab.
			 * @param {object} state - The page state object allows access to URL, page navigation and global group filter.
			 */
			focus: function(api, state) {

			},
			/**
			 * blur() is called whenever the user navigates away from the Add-In.
			 *
			 * Use this function to save the page state or commit changes to a data store or release memory.
			 *
			 * @param {object} api - The GeotabApi object for making calls to MyGeotab.
			 * @param {object} state - The page state object allows access to URL, page navigation and global group filter.
			 */
			blur: function(api, state) {


			}
		};
	};
