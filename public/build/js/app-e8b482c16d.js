var myApp = angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'oi.select',
    '720kb.datepicker',
    'chart.js',
    'angular.snackbar',
    'angular-loading-bar',
    'textAngular'
]);

myApp.run(['userFactory', '$cookies', '$rootScope', '$location',
    function(userFactory, $cookies, $rootScope, $location) {
        /*check if auth object is available*/
        if ($cookies.get('userObj') === undefined) {
            userFactory.getUserObj().success(function(response) {
                console.log('created user object', response);
                $cookies.putObject('userObj', response);
            });
        }

        /*handling the route change to check if the current url is access based*/
        $rootScope.$on("$routeChangeStart",
            function(event, next, current) {
                if (next.$$route.roles !== undefined) {
                    var access = false;
                    var userObj = $cookies.getObject('userObj');
                    console.log('userObj', userObj);
                    angular.forEach(next.$$route.roles, function(roleValue, roleKey) {
                        console.log(roleValue);
                        angular.forEach(userObj.roles, function(userValue, userKey) {
                            console.log(userValue);
                            if (roleValue == userValue.roleName) {
                                access = true;
                            }
                        });
                    });

                    console.log(access);
                    if (access == false) {
                        $location.path('access-denied');
                    }
                }
            });
    }
]);

myApp.filter('unsafe', function($sce) {
    return $sce.trustAsHtml;
});

myApp.controller('globalController', ['$scope', '$location',
    function($scope, $location) {
        angular.extend($scope, {
            reportTabUrl: '/templates/manager/reportTabs.html',
            singleProjectTab: '/templates/projects/singleProjectTab.html',
            checkActiveLink: function(currLink) {
                if ($location.path() == currLink) {
                    return 'active';
                }
            },
            timeAgo: function(string) {
                return moment(string).fromNow();
            },
            momentTime: function(string, format) {
                return moment(string).format(format);
            }
        })
    }
]);

/*Routes*/
myApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
            templateUrl: '/templates/manager/managerReports.html',
            controller: 'dashboardController'
        });

        $routeProvider.when('/logout', {
            templateUrl: '/templates/users/user-logout.html',
            controller: 'logoutController'
        });

        $routeProvider.when('/access-denied', {
            templateUrl: '/templates/admin/access-denied.html',
            controller: 'dashboardController'
        });

        $routeProvider.when('/report', {
            templateUrl: '/templates/manager/reports.html',
            controller: 'reportController',
            roles: ['Admin', 'Project Manager'],
            resolve: {
                action: function(clientFactory) {
                    return {
                        clients: clientFactory.getClientList()
                    }
                }
            }
        });

        $routeProvider.when('/projects', {
            templateUrl: '/templates/projects/projects-listing.html',
            controller: 'projectController',
            resolve: {
                action: function(projectFactory) {
                    return {
                        projects: projectFactory.getProjectList()
                    }
                }
            }
        });

        $routeProvider.when('/projects/add', {
            templateUrl: '/templates/projects/add-project.html',
            controller: 'projectController',
            roles: ['Admin', 'Project Manager'],
            resolve: {
                action: function(clientFactory) {
                    return {
                        clients: clientFactory.getClientList()
                    }
                }
            }
        });

        $routeProvider.when('/projects/:id', {
            templateUrl: '/templates/projects/projects-details.html',
            controller: 'projectController',
            resolve: {
                action: function() {
                    return 'single';
                }
            }
        });

        $routeProvider.when('/projects/:pid/comments', {
            templateUrl: '/templates/projects/project-comments.html',
            controller: 'projectController',
            roles: ['Admin', 'Project Manager'],
            resolve: {
                action: function(commentFactory, $route) {
                    return {
                        comments: commentFactory.getProjectComments($route.current.params.pid)
                    };
                }
            },
            roles: ['Admin', 'Project Manager']
        });

        $routeProvider.when('/projects/:id/estimate/add', {
            templateUrl: '/templates/projects/project-estimate-add.html',
            controller: 'projectController',
            resolve: {
                action: function() {
                    return 'single';
                }
            },
            roles: ['Admin', 'Project Manager']
        });

        $routeProvider.when('/projects/estimate/:estimateId', {
            templateUrl: '/templates/projects/estimate-edit.html',
            controller: 'projectController',
            resolve: {
                action: function() {
                    return 'single';
                }
            },
            roles: ['Admin', 'Project Manager']
        });

        /*Management URLs*/
        $routeProvider.when('/manage/back-date-entry', {
            templateUrl: '/templates/admin/backdateentry.html',
            controller: 'adminController',
            resolve: {
                action: function(userFactory, timeEntry) {
                    return {
                        users: userFactory.getUserList(),
                        allEntries: timeEntry.getBackDateEntries()
                    };
                }
            },
            roles: ['Admin', 'Project Manager']
        });

        $routeProvider.when('/manage/view-back-date-entry/:backdateentryId', {
            templateUrl: '/templates/admin/view-backdateentry.html',
            controller: 'adminController',
            resolve: {
                action: function(userFactory, timeEntry) {
                    return {
                        users: userFactory.getUserList(),
                        allEntries: timeEntry.getBackDateEntries()
                    };
                }
            },
            roles: ['Admin', 'Project Manager']
        });

        $routeProvider.when('/manage/view-back-date-entry/:backdateentryId', {
            templateUrl: '/templates/admin/view-backdateentry.html',
            controller: 'adminController',
            resolve: {
                action: function(userFactory, timeEntry) {
                    return {
                        users: userFactory.getUserList(),
                        allEntries: timeEntry.getBackDateEntries()
                    };
                }
            },
            roles: ['Admin', 'Project Manager']
        });

        $routeProvider.when('/user/request-backdate-entry', {
            templateUrl: '/templates/users/request-backdate.html',
            controller: 'userController',
            resolve: {
                action: function(userFactory, timeEntry) {
                    return {
                        users: userFactory.getUserListByRole(),
                        allEntries: timeEntry.getRequestBackDateEntries()
                    };

                }
            }
        });

        $routeProvider.when('/user/view-request-backdate/:backdateentryId', {
            templateUrl: '/templates/users/view-request-backdate.html',
            controller: 'userController',
            resolve: {
                action: function(userFactory, timeEntry, $route) {
                    return {
                        singleEntry: timeEntry.getRequestBackDateEntriesById($route.current.params.backdateentryId)

                    };
                }
            }
        });

        /*Ticket section*/
        $routeProvider.when('/ticket/list', {
            templateUrl: '/templates/tickets/list-ticket.html',
            controller: 'ticketController',
            roles: ['Admin', 'Project Manager'],
            resolve: {
                action: function(projectFactory, userFactory, ticketFactory) {
                    return {
                        tickets: ticketFactory.getAllTickets(),
                        projects: projectFactory.getProjectList(),
                        users: userFactory.getUserList(),
                        type: ticketFactory.getTickeType()
                    }
                }
            }
        });

        $routeProvider.when('/ticket/add', {
            templateUrl: '/templates/tickets/add-ticket.html',
            roles: ['Admin', 'Project Manager'],
            controller: 'ticketController',
            resolve: {
                action: function(projectFactory, userFactory, ticketFactory) {
                    return {
                        projects: projectFactory.getProjectList(),
                        users: userFactory.getUserList(),
                        type: ticketFactory.getTickeType()
                    }
                }
            }
        });

        $routeProvider.when('/ticket/view/:ticketId', {
            templateUrl: '/templates/tickets/view-ticket.html',
            controller: 'ticketController',
            resolve: {
                action: function(projectFactory, userFactory, ticketFactory, $route) {
                    return {
                        projects: projectFactory.getProjectList(),
                        users: userFactory.getUserList(),
                        type: ticketFactory.getTickeType(),
                        ticket: ticketFactory.getTicketById($route.current.params.ticketId)
                    }
                }
            }
        });

        $routeProvider.when('/ticket/my-tickets', {
            templateUrl: '/templates/tickets/my-tickets.html',
            controller: 'ticketController',
            resolve: {
                action: function(ticketFactory) {
                    return {
                        myTickets: ticketFactory.getMyTickets(),
                    }
                }
            }
        });

        $routeProvider.otherwise('/');
    }
]);

myApp.factory('clientFactory', ['$http', function($http) {
    var clientFactory = {};

    clientFactory.getClientList = function() {
        return $http.get(baseUrl + 'api/get-client-list');
    }

    return clientFactory;
}]);

/**
 * Created by amitav on 12/13/15.
 */
myApp.factory('commentFactory', ['$http', function($http) {
    var commentFactory = {};

    commentFactory.getProjectComments = function(projectId) {
        console.log('Project id', projectId);
        return $http.get(baseUrl + 'api/get-project-comments/' + projectId);
    }

    commentFactory.saveComment = function (commentData) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/save-project-comment',
            method: 'POST',
            data: commentData
        });
    }

    return commentFactory;
}]);

myApp.factory('estimateFactory', ['$http', function($http) {
    var estimateFactory = {};

    estimateFactory.getEstimateById = function(id) {
        return $http.get(baseUrl + 'api/get-estimate-by-id/' + id);
    }

    estimateFactory.updateEstimate = function(estimateData) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/update-estimate-by-id',
            method: 'POST',
            data: estimateData
        });
    }

    return estimateFactory;
}])

myApp.controller('projectController', ['$scope', 'projectFactory', '$routeParams', 'snackbar', '$location', 'action', 'clientFactory', 'estimateFactory', 'timeEntry', 'commentFactory',

    function($scope, projectFactory, $routeParams, snackbar, $location, action, clientFactory, estimateFactory, timeEntry, commentFactory) {

        /*loading all projects*/
        if (action && action.projects != undefined) {
            action.projects.success(function(response) {
                console.log('all projects', response);
                $scope.projects = response;
            });
        }

        if (action && action.clients != undefined) {
            action.clients.success(function(response) {
                console.log('all clients', response);
                $scope.clients = response;
            });
        }

        /*Loading the comments for a project*/
        if (action && action.comments != undefined) {
            $scope.singleProjectId = $routeParams.pid;
            action.comments.success(function(response) {
                console.log('all comments', response);
                $scope.singleProject = response;
                $scope.comments = response;
            });
        }

        /*load single project data*/
        if ($routeParams.id) {
            $scope.singleProjectId = $routeParams.id;
            projectFactory.getProjectById($routeParams.id).success(function(response) {
                console.log('Single project', response);
                $scope.singleProject = response;
                $scope.singleProject.hours_allocated = 0;
                $scope.singleProject.hours_consumed = 0;

                angular.forEach(response.estimates, function(estimate, key) {
                    $scope.singleProject.hours_allocated += estimate.hours_allocated;
                    $scope.singleProject.hours_consumed += estimate.hours_consumed;
                });

                $scope.singleProject.percent_complete = $scope.singleProject.hours_consumed / $scope.singleProject.hours_allocated * 100;
                $scope.singleProject.percent_complete = parseFloat($scope.singleProject.percent_complete).toFixed(2);

                $scope.showSingleProject = true;
            });
        }

        /*When looking at an individual estimate*/
        if ($routeParams.estimateId) {
            /*Get the estimate details by id*/
            estimateFactory.getEstimateById($routeParams.estimateId).success(function(response) {
                console.log('Need to load estimate', response);
                $scope.singleEstimate = response;

                /*Get the project details by id*/
                projectFactory.getProjectById(response.project_id).success(function(response) {
                    console.log('Single project', response);
                    $scope.singleProject = response;
                    $scope.showSingleEstimate = true;

                    /*Get time entries for the estimate*/
                    timeEntry.getEntriesForEstimate($scope.singleEstimate.id).success(function(response) {
                        $scope.estimateTimes = response;
                        $scope.estimateTimes.total = 0;
                        angular.forEach(response, function(estimate, key) {
                            $scope.estimateTimes.total += estimate.time;
                        });

                        $scope.estimateTimes.total = parseFloat($scope.estimateTimes.total).toPrecision(2);
                        console.log('Time entries', response);
                    });
                });
            });
        }

        angular.extend($scope, {
            singleProject: {},
            showSingleProject: false,
            showSingleEstimate: false,
            newEstimateFormSubmit: false,
            projectEstimte: {},
            singleEstimate: {},
            newProject: {}
        });

        angular.extend($scope, {
            saveComment: function(addCommentForm) {
                if (addCommentForm.$valid) {
                    console.log($scope.newComment, $routeParams.pid);
                    var commentData = {
                        comment: $scope.newComment,
                        project_id: $routeParams.pid
                    };
                    commentFactory.saveComment(commentData).success(function(response) {
                        console.log(response);
                        $scope.singleProject = response;
                        $scope.comments = response;
                        $scope.newComment = "";
                    });
                } else {
                    $scope.newEstimateFormSubmit = true;
                    snackbar.create("Your form has errors!!", 1000);
                }
            },
            deleteProject: function() {
                var r = confirm("This will delete the project and it's time. Ok?");
                if (r === true) {
                    projectFactory.deleteProject($routeParams.id).success(function(response) {
                        $location.path('/projects');
                        snackbar.create("Project deleted", 1000);
                    });
                }
            },
            editEstiate: function(editEstimateForm) {
                if (editEstimateForm.$valid) {
                    var estimateData = {
                        id: $scope.singleEstimate.id,
                        desc: $scope.singleEstimate.desc,
                        hours_allocated: $scope.singleEstimate.hours_allocated,
                        status: $scope.singleEstimate.status
                    };

                    estimateFactory.updateEstimate(estimateData).success(function(response) {
                        console.log('estimate edited', response);
                        $location.path('/projects/' + $scope.singleProject.id);
                        snackbar.create("Estimate saved", 1000);
                    });
                } else {
                    $scope.newEstimateFormSubmit = true;
                    snackbar.create("Your form has errors!!", 1000);
                }
            },
            addNewProject: function(addProjectForm) {
                if (addProjectForm.$valid) {
                    console.log($scope.newProject);
                    var newProjectData = {
                        name: $scope.newProject.name,
                        client: $scope.newProject.client_id[0].id
                    };
                    projectFactory.saveNewProject(newProjectData).success(function(response) {
                        console.log('save new project', response);
                        $location.path('/projects');
                        snackbar.create("Project added", 1000);
                    })
                } else {
                    $scope.newEstimateFormSubmit = true;
                    snackbar.create("Your form has errors!!", 1000);
                }
            },
            saveProjectEstimate: function(addProjectEstimateForm) {
                if (addProjectEstimateForm.$valid) {
                    console.log('$scope.projectEstimte', $scope.projectEstimte);
                    var estimateData = {
                        project_id: $routeParams.id,
                        desc: $scope.projectEstimte.desc,
                        hours_allocated: $scope.projectEstimte.hours_allocated,
                    };

                    projectFactory.saveProjectEstimate(estimateData).success(function(response) {
                        console.log(response);
                        $location.path('/projects/' + $routeParams.id);
                        snackbar.create("Estimate added", 1000);
                    });
                } else {
                    $scope.newEstimateFormSubmit = true;
                    snackbar.create("Your form has errors!!", 1000);
                }
            }
        });
    }
]);

myApp.factory('projectFactory', ['$http', function($http) {
    var projectFactory = {};

    projectFactory.getProjectList = function() {
        return $http.get(baseUrl + 'api/get-project-list');
    }

    projectFactory.getProjectById = function(id) {
        return $http.get(baseUrl + 'api/get-project-by-id/' + id);
    }

    projectFactory.saveProjectEstimate = function(estimateData) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/save-project-estimate',
            method: 'POST',
            data: estimateData
        });
    }

    projectFactory.saveNewProject = function(newProjectData) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/save-new-project',
            method: 'POST',
            data: newProjectData
        });
    }

    projectFactory.deleteProject = function(id) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/delete-project',
            method: 'POST',
            data: {
                id: id
            }
        });
    }

    return projectFactory;
}]);

myApp.controller('dashboardController', ['$scope', 'timeEntry', '$parse',
    function($scope, timeEntry, $parse) {
        timeEntry.getTimeSheetEntryByDate().success(function(response) {
            $scope.timeEntryOverview = response;
        });

        angular.extend($scope, {
            graphLabels: {}
        });

        angular.extend($scope, {
            changeTag: function(url) {
                $scope.tabUrl = url;
            }
        });

        $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
        $scope.data = [300, 500, 100];
    }
]);

myApp.controller('reportController', ['$scope', 'timeEntry', '$timeout', 'projectFactory', 'userFactory', 'action',
    function($scope, timeEntry, $timeout, projectFactory, userFactory, action) {

        /*check if clients are loaded*/
        if (action && action.clients != undefined) {
            action.clients.success(function(response) {
                console.log('all clients', response);
                $scope.clients = response;
            });
        }

        timeEntry.getEntries().then(function(response) {
                console.log('time entries', response.data);
                $scope.timeEntries = response.data;
                angular.forEach(response.data, function(value, key) {
                    $scope.totalTime = $scope.totalTime + value.time;
                });
                return response;
            })
            .then(function() {
                userFactory.getUserList().then(function(response) {
                    console.log('user list', response.data);
                    angular.forEach(response.data, function(value, key) {
                        $scope.users.push(value);
                    });
                });
            })
            .then(function() {
                projectFactory.getProjectList().then(function(response) {
                    console.log('project list', response.data);
                    angular.forEach(response.data, function(value, key) {
                        $scope.projects.push(value);
                    });

                    $timeout(function() {
                        $scope.showData = true;
                    }, 500);
                });
            });

        angular.extend($scope, {
            totalTime: 0,
            showData: false,
            filters: {},
            users: [],
            projects: [],
            clients: {},
            dt: new Date()
        });

        angular.extend($scope, {
            filterTime: function(filterTimeFrm) {
                console.log($scope.filters);
                var queryParams = {};

                if ($scope.filters.desc != "") {
                    queryParams.desc = $scope.filters.desc;
                }

                if ($scope.filters.users !== undefined && $scope.filters.users.length > 0) {
                    queryParams.users = [];
                    angular.forEach($scope.filters.users, function(value, key) {
                        queryParams.users.push(value.id);
                    });
                }

                if ($scope.filters.clients !== undefined && $scope.filters.clients.length > 0) {
                    queryParams.clients = [];
                    angular.forEach($scope.filters.clients, function(value, key) {
                        queryParams.clients.push(value.name);
                    });
                }

                if ($scope.filters.project !== undefined && $scope.filters.project.length > 0) {
                    queryParams.projects = [];
                    angular.forEach($scope.filters.project, function(value, key) {
                        queryParams.projects.push(value.id);
                    });
                }

                if ($scope.filters.startDate !== undefined) {
                    queryParams.startDate = $scope.filters.startDate;
                }

                if ($scope.filters.endDate !== undefined) {
                    queryParams.endDate = $scope.filters.endDate;
                    var startDateOfYear = moment(queryParams.startDate).dayOfYear();
                    var endDateOfYear = moment(queryParams.endDate).dayOfYear();

                    if ($scope.filters.startDate !== undefined && endDateOfYear < startDateOfYear) {
                        alert('End date is before start date.');
                        return false;
                    }
                }

                timeEntry.getSearchResult(queryParams).then(function(response) {
                    console.log('search result', response.data);
                    $scope.timeEntries = response.data;
                    $scope.totalTime = 0;
                    angular.forEach(response.data, function(value, key) {
                        $scope.totalTime = $scope.totalTime + value.time;
                    });
                });
            },
            clearFilters: function() {
                $scope.filters = {};
            }
        });
    }
]);

myApp.factory('timeEntry', ['$http', function($http) {
    var timeEntry = {};

    timeEntry.getEntries = function() {
        return $http.get(baseUrl + 'api/time-report');
    }

    /*timeEntry.getUserList = function() {
        return $http.get(baseUrl + 'api/get-user-list');
    }*/

    timeEntry.getSearchResult = function(filterParams) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/time-report-filter',
            method: 'POST',
            data: filterParams
        });
    }

    timeEntry.getTimeSheetEntryByDate = function() {
        return $http.get(baseUrl + 'api/get-timeentry-by-date');
    }

    timeEntry.getEntriesForEstimate = function(estimateId) {
        return $http.get(baseUrl + 'api/get-timeentry-for-estimate/' + estimateId);
    }

    timeEntry.getBackDateEntries = function() {
        return $http.get(baseUrl + 'api/get-backdate-entries');
    }

    timeEntry.saveBackDateEntry = function(entryData) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/allow-backdate-entry',
            method: 'POST',
            data: entryData
        });
    }

    timeEntry.getRequestBackDateEntries = function() {
        return $http.get(baseUrl + 'api/get-request-backdate-entries');
    }

    timeEntry.getRequestBackDateEntriesById = function(id) {
        return $http.get(baseUrl + 'api/get-request-backdate-entries-by-id/' + id);
    }

    timeEntry.saveRequestBackDateEntry = function(entryData) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/allow-request-backdate-entry',
            method: 'POST',
            data: entryData
        });
    }

    return timeEntry;
}]);

myApp.controller('adminController', ['$scope', 'action', 'timeEntry', 'snackbar',
    function($scope, action, timeEntry, snackbar) {

        /*check if users are loaded*/
        if (action && action.users != undefined) {
            action.users.success(function(response) {
                console.log('all users', response);
                $scope.users = response;
            });
        }

        if (action && action.allEntries != undefined) {
            window.document.title = 'Backdate entry';

            action.allEntries.success(function(response) {
                if (response.length != 0) {
                    console.log('all Entries', response.length);
                    $scope.allEntries = response;
                    $scope.showEntries = true;
                }
            });
        }

        /*Variables*/
        angular.extend($scope, {
            backdateEntry: {},
            allEntries: {},
            showEntries: false
        });

        /*Methods*/
        angular.extend($scope, {
            backdateEntrySubmit: function(backdateEntryForm) {
                if (backdateEntryForm.$valid) {
                    /*get all the user ids*/
                    var userIds = [];
                    if ($scope.backdateEntry != undefined) {
                        angular.forEach($scope.backdateEntry.users, function(value, key) {
                            userIds.push(value.id);
                        });
                    }

                    /*create the post data*/
                    var entryData = {
                        date: $scope.backdateEntry.backdate,
                        users: userIds,
                        comment: $scope.backdateEntry.reason
                    };

                    timeEntry.saveBackDateEntry(entryData).success(function(response) {
                        console.log('backdate entries', response);
                        $scope.allEntries = response;
                        $scope.backdateEntry = {};
                        $scope.showEntries = true;
                        snackbar.create("Entry added and mail sent.", 1000);
                    });
                }
            }
        });
    }
]);

/**
 * Created by amitav on 12/29/15.
 */
myApp.controller('ticketController', ['$scope', 'action', 'ticketFactory', '$location', 'snackbar', '$routeParams',
    function($scope, action, ticketFactory, $location, snackbar, $routeParams) {

        /*check if projects are loaded*/
        if (action && action.projects != undefined) {
            action.projects.success(function(response) {
                console.log('all projects', response);
                $scope.projects = response;
                $scope.showTicketForm = true;
            });
        }

        /*check if users are loaded*/
        if (action && action.users != undefined) {
            action.users.success(function(response) {
                console.log('all users', response);
                $scope.users = response;
            });
        }

        /*load ticket type*/
        if (action && action.type != undefined) {
            action.type.success(function(response) {
                console.log('all type', response);
                $scope.ticketType = response;
            });
        }

        /*load tickets*/
        if (action && action.tickets != undefined) {
            action.tickets.success(function(response) {
                console.log('all tickets', response);
                $scope.tickets = response;
                $scope.viewTickets = true;
            });
        }

        /*loading single ticket*/
        if (action && action.ticket != undefined) {
            $scope.showTicketForm = false;
            action.ticket.success(function(response) {
                console.log('thisTicket', response);
                $scope.newTicket = response.data;
                $scope.showTicketForm = true;
            });
        }

        /*loading user's tickets*/
        if (action && action.myTickets != undefined) {
            action.myTickets.success(function(response) {
                console.log('myTickets', response);
                $scope.myTickets = response.data;
                $scope.viewMyTickets = true;
            });
        }

        /*model*/
        angular.extend($scope, {
            formUrl: baseUrl + 'templates/tickets/ticket-form.html',
            showTicketForm: false,
            newTicket: {
                type: 'none'
            },
            projects: {},
            ticketType: {},
            tickets: {},
            myTickets: {},
            viewMyTickets: false,
            viewTickets: true
        });

        /*methods*/
        angular.extend($scope, {
            saveNewTicket: function(addTicketForm) {
                if (addTicketForm.$valid) {
                    // console.log($scope.newTicket);
                    var ticketData = {
                        title: $scope.newTicket.title,
                        description: $scope.newTicket.comment,
                        complete_date: $scope.newTicket.completeDate,
                        project_id: $scope.newTicket.project[0].id,
                        assigned_to: $scope.newTicket.users[0].id,
                        followers: [],
                        type: $scope.newTicket.type
                    };

                    /*Adding follower ids*/
                    angular.forEach($scope.newTicket.followers, function(value, key) {
                        ticketData.followers.push(value.id);
                    });

                    ticketFactory.saveTicket(ticketData).success(function(response) {
                        console.log(response);
                        $location.path('/ticket/list');
                        snackbar.create("New ticket added.", 1000);
                    });
                }
            },
            updateTicket: function(updateTicketForm) {
                if (updateTicketForm.$valid) {
                    var ticketData = {
                        title: $scope.newTicket.title,
                        description: $scope.newTicket.comment,
                        complete_date: $scope.newTicket.completeDate,
                        project_id: $scope.newTicket.project[0].id,
                        assigned_to: $scope.newTicket.users[0].id,
                        followers: [],
                        type: $scope.newTicket.type,
                        id: $routeParams.ticketId
                    };

                    /*Adding follower ids*/
                    angular.forEach($scope.newTicket.followers, function(value, key) {
                        ticketData.followers.push(value.id);
                    });

                    ticketFactory.updateTicket(ticketData).success(function(response) {
                        console.log(response);
                        $location.path('/ticket/list');
                        snackbar.create("Ticket updated.", 1000);
                    });
                }
            }
        });

    }
]);

myApp.factory('ticketFactory', ['$http', function($http) {
    var ticketFactory = {};

    ticketFactory.saveTicket = function(ticketData) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/save-new-ticket',
            method: 'POST',
            data: ticketData
        });
    }

    ticketFactory.updateTicket = function(ticketData) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'api/update-ticket',
            method: 'POST',
            data: ticketData
        });
    }

    ticketFactory.getAllTickets = function() {
        return $http.get(baseUrl + 'api/get-ticket');
    }

    ticketFactory.getTicketById = function(id) {
        return $http.get(baseUrl + 'api/get-ticket-by-id/' + id);
    }

    ticketFactory.getTickeType = function() {
        return $http.get(baseUrl + 'api/get-ticket-types');
    }

    ticketFactory.getMyTickets = function() {
        return $http.get(baseUrl + 'api/get-my-tickets');
    }

    return ticketFactory;
}])

myApp.controller('logoutController', ['$scope', 'userFactory',
    function($scope, userFactory) {
        userFactory.logoutUser().success(function(response) {
            console.log('logout', response);
            window.location = baseUrl;
        });
    }
]);

myApp.controller('userController', ['$scope', 'action', 'timeEntry', '$location', 'userFactory', 'snackbar',
    function($scope, action, timeEntry, $location, userFactory, snackbar) {
        /*check if users are loaded*/
        if (action && action.users != undefined) {
            action.users.success(function(response) {
                console.log('all users', response);
                $scope.users = response;
            });
        }

        if (action && action.allEntries != undefined) {
            window.document.title = 'Request Backdate entry';

            action.allEntries.success(function(response) {
                if (response.length != 0) {
                    console.log('all Entries', response.length);
                    $scope.allEntries = response;
                    $scope.showEntries = true;
                }
            });
        }

        /*Variables*/
        angular.extend($scope, {
            requestBackdate: {},
            allEntries: {},
            showEntries: false
        });

        /*Methods*/
        angular.extend($scope, {
            requestBackdateSubmit: function(requestBackdateForm) {
                if (requestBackdateForm.$valid) {
                    /*get all the user ids*/
                    var userIds = [];
                    if ($scope.requestBackdate != undefined) {
                        angular.forEach($scope.requestBackdate.users, function(value, key) {
                            userIds.push(value.id);
                        });
                    }

                    /*create the post data*/
                    var entryData = {
                        date: $scope.requestBackdate.backdate,
                        users: userIds,
                        comment: $scope.requestBackdate.reason
                    };

                    timeEntry.saveRequestBackDateEntry(entryData).success(function(response) {
                        console.log('backdate entries', response);
                        $scope.allEntries = response;
                        $scope.requestBackdate = {};
                        $scope.showEntries = true;
                        snackbar.create("Entry added and mail sent.", 1000);
                    });
                }
            }
        });

    }
]);

myApp.factory('userFactory', ['$http', '$cookies',
    function($http, $cookies) {
        var userFactory = {};

        userFactory.logoutUser = function() {
            $cookies.remove('userObj');
            return $http.get(baseUrl + 'logout');
        }

        userFactory.getUserList = function() {
            return $http.get(baseUrl + 'api/get-user-list');
        }

        userFactory.getUserObj = function() {
            return $http.get(baseUrl + 'api/get-user_data');
        }

        userFactory.getUserListByRole = function() {
            /*Code for loading users by role id*/
            var role = [1,3];
            var jsonData=JSON.stringify(role);

            return $http({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: baseUrl + 'api/get-user-list-by-role',
                method: 'POST',
                data:  jsonData
            });
        }

        return userFactory;
    }
]);

//# sourceMappingURL=app.js.map
