geotab.addin.authoritySwitcher = function(api, state) {
		let	companyName = document.getElementById("companyName"),
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
			groupCache = {},
			groupsSelected = [],
			
			isEmpty = function(obj) {
				for (let prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						return false;
					}
				}
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
						}
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
			updateAddInData = function(addInPayload, groups) {
				addInPayload[0].groups = groups || addInPayload[0].groups;
				return new Promise(function(resolve, reject) {
					api.call("Set", {
						"typeName": "AddInData",
						"entity": addInPayload[0]
					}, function(result) {
						//window.location.reload(false);
						resolve(result);
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
							// add message to use to tell them no auths exist
						}
					}, function (error) {
						reject(error);
						//add error handling
					});
				});
			},
			errorHandler = function(msg) {
				let alertError = document.getElementById("alertError"),
					errorMessageTimer;
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
						groupNames.push(groupCache[authorities[0].groups[j]]);
					}
					groupsList.innerHTML = groupNames;
				} else {
					companyName.disabled = true;
					companyAddress.disabled = true;
					authorityName.disabled = true;
					authorityAddress.disabled = true;
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

			},
			
			emptyAuth = function(authorityObj) {
				for (let key in authorityObj) {
					if (!authorityObj[key] || authorityObj[key].length == 0) {
						return true;
					}
				}
				return false;
			},
		
			addAuthority = function() {
				let groups = [],
					authorityObj;
				grabAddInData().then(async function(addInObj) {
					for (let i = 0; i < groupsSelected.length; i++) {
						groups.push(groupsSelected[i]);
					}
					authorityObj = {
						"companyName": companyNameNew.value,
						"companyAddress": companyAddressNew.value,
						"authorityName": authorityNameNew.value,
						"authorityAddress": authorityAddressNew.value,
						"carrierNumber": carrierNumberNew.value,
						"groups": groupsSelected
					};
					
					if (emptyAuth(authorityObj)) {
						errorHandler("Please fill out all the fields and select at least one group to add an authority.");
					} else {
						// check if we have no authorities in the addInData object
						if (Object.keys(JSON.parse(addInObj[0].data)).length == 0) {
							// add new authority
							addInObj[0].data = JSON.stringify({
								"authorities": [authorityObj]
							});
							await updateAddInData(addInObj);
							window.location.reload(false);
						} else {
							let temp = JSON.parse(addInObj[0].data);
							temp.authorities.push(authorityObj);

							addInObj[0].data = JSON.stringify(temp);
							await updateAddInData(addInObj);
							window.location.reload(false);
						}
					} 			
				});
			},
			
			editAuthority = function() {
				grabAddInData().then(async function(addInObj) {
					let temp = JSON.parse(addInObj[0].data);
					let authorityObj = {
						"companyName": companyName.value,
						"companyAddress": companyAddress.value,
						"authorityName": authorityName.value,
						"authorityAddress": authorityAddress.value,
						"carrierNumber": carrierNumber.value,
						"groups": groupsSelected
					};
					console.log(groupsSelected);
					if (emptyAuth(authorityObj)) {
						errorHandler("Please fill out all the fields and select at least one group to add or edit an authority.");
					} else {
						for (let auth in temp.authorities) {
							if (temp.authorities[auth].authorityName == selected) {
								temp.authorities[auth] = authorityObj;
							}
						}
						addInObj[0].data = JSON.stringify(temp);
						await updateAddInData(addInObj);
						window.location.reload(false);
					}
				});
			},
		
			addDataStore = function(groups, data) {
				return new Promise(function(resolve, reject) {
					data = data || [];
					api.call("Add", {
						"typeName": "AddInData",
						"entity": {
							"addInId": "aMO4bMooow0KlW2WdaT2suw",
							"groups": groups,
							"data": data
							
						}
					}, function(results) {
						resolve(results);
					});
				});
			},


			//For deleting the current authority displayed
			clearInfo = function() {
				grabAddInData().then(function(tempData) {
					let tempAuthList = JSON.parse(tempData[0].data);
					
					if (tempData.length == 0) {
						errorHandler("There are no authorities saved in this database to delete.");
						// message to tell user that there is nothing to delete
					} else if (tempAuthList.authorities.length > 1){
						for (let i = 0; i < tempAuthList.authorities.length; i++) {
							if (tempAuthList.authorities[i].authorityName == selected) {
								tempAuthList.authorities.splice(i,1);
							}
						}
						tempData[0].data = JSON.stringify(tempAuthList);
						api.call("Set", {
							"typeName": "AddInData",
							"entity": tempData[0]
						}, function (result) {
							window.location.reload(false);
						});
					} else {
						api.call("Remove", {"typeName": "AddInData",
							"entity": {
								"id": tempData[0].id,
								"addInId": id
							}
						}, function(result) {
							window.location.reload(false);
						});
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
					div.innerHTML = '<div class="dialog-title">&nbsp;</div></a><a href="javascript:;" class="dialog-close" title="Close">&times;</a><div class="dialog-content">&nbsp;</div><div class="dialog-action"></div>';
					ovr.className = 'dialog-box-auth-overlay';
				b.body.appendChild(div);
				b.body.appendChild(ovr);
			})();

			var maximize = false,
				dialog = b.getElementById('dialog-box-auth-' + uniqueId), // The HTML of dialog box
				dialog_title = dialog.children[0],
				dialog_close = dialog.children[1],
				dialog_content = dialog.children[2],
				dialog_action = dialog.children[3],
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
								setDialog('close');
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

				/* dialog_minmax.innerHTML = '&ndash;';
				dialog_minmax.title = 'Minimize';
				dialog_minmax.onclick = dialogMinMax; */

				dialog_close.onclick = function() {
					setDialog("close", {content:""});
				};

				b.onmousemove = _move_elem;
				b.onmouseup = _destroy;

				maximize = (set === "open") ? true : false;

			};

			// Maximized or minimized dialog box
			/* function dialogMinMax() {
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
			} */

		})(window, document);
		return {
			initialize: function(api, state, addInReady) {
				let addNew = document.getElementById("addAuth"),
					saveChanges = document.getElementById("saveEdit"),
					deleteAuth = document.getElementById("clear"),
					helpButton = document.getElementById("authHelpButton"),
					authorityDropDown = document.getElementById("import-authorities"),
					groupsSelectBox = document.getElementById("import-groups"),
					newSelectBox = document.getElementById("newGroups"),
					newTab = document.getElementById("newTab"),
					editTab = document.getElementById("editTab"),
					newMenu = document.getElementById("primaryTab"),
					editMenu = document.getElementById("secondaryTab");
					
				// MUST call addInReady when done any setup
				addNew.addEventListener("click", function() {
					addAuthority();
				}, false);

				saveChanges.addEventListener("click", function() {
					editAuthority();
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
					});
				}, false);
				newTab.addEventListener("click", function() {
					makeActive(newTab, newMenu);				
					makeInActive(editTab, editMenu);
					addNew.style.display = "block";
					saveChanges.style.display = "none";
					deleteAuth.style.display = "none";
					grabGroups().then(function(rawGroupObj) {
						populateSelectBox(rawGroupObj, true);
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
					});				
				});
				
				authorityDropDown.addEventListener("change", function() {
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
									groupNames.push(groupCache[addInDataCache.authorities[i].groups[j]]);
								}
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
				
				checkUserClearance().then(async function(approved) {
					if (approved) {
						let rawGroupObj = await grabGroups();
						populateSelectBox(rawGroupObj, true);
						let rawAddInObj = await grabAddInData();
						populateForm(rawAddInObj);
						let groupIds = [];
						for (let i = 0; i < rawGroupObj.length; i++) {
							if (rawGroupObj[i].id !== "GroupCompanyId") {
								groupIds.push({"id": rawGroupObj[i].id});
							}
						}
						if (rawAddInObj.length === 0) {
							let data = JSON.stringify(
								{}
							);
							addDataStore(groupIds, data);
						} else {
							await updateAddInData(rawAddInObj, groupIds);
						}
					} else {
						document.getElementById("authoritySwitcherTabs").style.display = "none";
						helpButton.style.display = "none";
						addNew.disabled = true;
						errorHandler("Administrator Clearance is required to use this add-in.");
					}
				});
				addInReady();
			},

			focus: function(api, state) {

			},
			blur: function(api, state) {

			}
		};
	};