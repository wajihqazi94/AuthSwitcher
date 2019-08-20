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

        populateSelect = async function(activeUser) {
			let currentUser = activeUser,
				accessList = [],
				groups = [],
				addInData = await grabAddInData();
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
					let groupDetails = await grabGroup(currentGroup),
						children = groupDetails[0].children;
					if (children.length > 0) {
						for (let childIndex = 0; childIndex < children.length; childIndex++) {
							groups.push(children[childIndex].id);
						}
					}
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
        };


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
            // MUST call addInReady when done any setup
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
