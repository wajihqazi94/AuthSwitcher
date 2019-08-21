geotab.addin.authoritySwitcher = function(api, state) {
    let save = document.getElementById("saveMe"),
        storedData = [],
        currentUser,
		current = document.getElementById("current"),
		
        saveNewInfo = function() {
			grabUser().then(function(activeUser) {
				let selectedAuthority = document.getElementById("importauthorities").value;
				for (let i = 0; i < storedData.length; i++) {
					if (storedData[i].authorityName === selectedAuthority) {

						activeUser.authorityName = storedData[i].authorityName;
						activeUser.companyName = storedData[i].companyName;
						activeUser.companyAddress = storedData[i].companyAddress;
						activeUser.authorityAddress = storedData[i].authorityAddress;
						activeUser.carrierNumber = storedData[i].carrierNumber;
						
						api.call("Set", {
							typeName: "User",
							entity: activeUser
						}, function(result) {
							window.location.reload(true);
						});
					}
				}
			});
        },
		
		grabUser = function () {
			return new Promise(function(resolve, reject) { 
				api.call("Get", {"typeName": "User",
					"search": {
						"name": currentUser
					}
				}, function(result) {
					resolve(result[0]);
				})
			});
		},
		
		grabGroup = function(groupId) {
			return new Promise(function(resolve, reject) {
				api.call("Get", {"typeName": "Group", 
					"search": {
						"id": groupId
					}
				}, function(result) {
					resolve(result);
				}, function(e) {
					reject(e);
				});
			});
		},
		
		grabAddInData = function() {
			return new Promise(function(resolve, reject) {
				api.call("Get", {"typeName": "AddInData",
					"search": {
						"addInId": "aMO4bMooow0KlW2WdaT2suw"
					}
				}, function(result) {
					resolve(JSON.parse(result[0].data));
				})
			})
		},
		
		contain = function(target, access) {
			return target.every(function(t) {
				return access.includes(t);
			});
		},

        populateSelect = function(activeUser) {
			let currentUser = activeUser,
				accessList = [],
				groups = [];
				
			grabAddInData().then(function(addInData) {
					for (let groupIndex = 0; groupIndex < currentUser.companyGroups.length; groupIndex++) {
					groups.push(currentUser.companyGroups[groupIndex].id);
				}
				
				if (currentUser.companyGroups[0].id === "GroupCompanyId") {
					for (let authorityIndex = 0; authorityIndex < addInData.authorities.length; authorityIndex++) {
							storedData.push(addInData.authorities[authorityIndex]);
					}
				} else {
					while (groups.length > 0) {
						let currentGroup = groups.shift();
						accessList.push(currentGroup);
						grabGroup(currentGroup).then(function(groupDetails) {
							let children = groupDetails[0].children;
							if (children.length > 0) {
								for (let childIndex = 0; childIndex < children.length; childIndex++) {
									groups.push(children[childIndex].id);
								}
							}
						})
					}
					
					for (let authorityIndex = 0; authorityIndex < addInData.authorities.length; authorityIndex++) {
						if (contain(addInData.authorities[authorityIndex].groups, accessList)) {
							storedData.push(addInData.authorities[authorityIndex]);
						}
					}
				};
				
				if (storedData.length > 0) {

					//Grab All Data and display
					for (let i = 0; i < storedData.length; i++) {
						let authSelect = document.getElementById("importauthorities");

						storedData.sort(function(a, b) {
							if (a.authorityName.toLowerCase() < b.authorityName.toLowerCase()) {
								return -1;
							}
							if (a.authorityName.toLowerCase() > b.authorityName.toLowerCase()) {
								return 1;
							}
							return 0;
						});
						for (i = 0; i < storedData.length; i++) {
							if (storedData[i].authorityName !== activeUser.authorityName) {
								let authOption = new Option();
								authOption.text = storedData[i].authorityName;
								authOption.value = storedData[i].authorityName;
								authSelect.add(authOption);
							}
						}
					}
				}
			})
			
        };


    return {
        initialize: function(api, state, addInReady) {

            api.getSession(function(session) {
                currentUser = session.userName;
				grabUser().then(function(activeUser) {
					current.innerHTML = activeUser.authorityName;
					populateSelect(activeUser);
				});
                
            });
			
			save.addEventListener("click", function() {
                saveNewInfo();
            }, false);
			addInReady();
        },
        focus: function(api, state) {
            
        },
        blur: function(api, state) {


        }
    };
};
