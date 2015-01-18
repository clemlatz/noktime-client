var app = angular.module('noktime', ['ui.sortable', 'ngSanitize']);

/* MODELS */

var Task = function(name, id, order, created, completed, snoozed) {
	this.id = id;
	this.name = name;
	this.created = created || new Date();
	this.completed = completed || false;
	this.snoozed = snoozed || false;
};

/* FILTERS */

app.filter('fancy', function() {
	return function(input) {
		return input.replace(/(#\S*)/g, '<span class="label label-success">$1</span>')
			.replace(/(@\S*)/g, '<span class="label label-info">$1</span>');
  	};
});

/* CONTROLLERS */

app.controller('TabController', function() {
	this.selected = 'tasks';
});

app.controller('TaskController', function($scope) {

	var ctrl = this;
	
	ctrl.newTask = new Task();

	// Create new task
	this.create = function() {
		$scope.tasks.push(this.newTask);
		log('Added task: '+this.newTask.name);
		this.newTask = new Task(); // reset new task placeholder
	};
	
	// Edit existing task
	this.edit = function(task) {
		var newName = prompt('New name ?', task.name);
		if (newName) {
			log('Task name changed from '+task.name+' to'+newName);
			task.name = newName;
		}
	};
	
	// Snooze task
	this.snooze = function(task) {
		task.snoozed = true;
		if (task.snoozedTo === null) {
			delete task.snoozedTo;
			task.snoozed = false;
		}
		task.showSnoozer = false;
	};
	
	// Remove task from list
	this.remove = function(task) {
		var index = $scope.tasks.indexOf(task);
		$scope.tasks.splice(index, 1);
		log('Task '+task.name+' deleted');
	};
	
	// Save to localStorage
	this.save = function() {
		localStorage.tasks = angular.toJson($scope.tasks);
		log('Tasks saved to localStorage');
	};
	
	// Load from localStorage
	this.load = function() {
		if (localStorage.tasks) {
			log('Tasks loaded from localStorage');
			var tasks = JSON.parse(localStorage.tasks);
			
			// Convert date to object
			$.map(tasks, function(item, index) {
				if (typeof item.snoozedTo != 'undefined') {
					item.snoozedTo = new Date(item.snoozedTo);
					
					// If snoozedTo date is in the past
					if (item.snoozedTo <= new Date()) {
						delete item.snoozedTo;
						item.snoozed = false;
					}
					
					item.snoozedTo = new Date(item.snoozedTo);
				} else item.snoozed = false;
				return item;
			});
			
			return tasks;
		}
		
		return [];
	};	
	
	// Load tasks on startup
	$scope.tasks = this.load();

	$scope.$watch('tasks', function(newVal, oldVal) {
		ctrl.save();
	}, true);
	
	// Options
	$scope.minDate = new Date();
	$scope.showCompleted = false;
	$scope.showSnoozed = false;
	$scope.filterBy = '';
	
});

/* HELPERS */

function log(msg) {
	console.log(msg);
}
