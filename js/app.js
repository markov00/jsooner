String.space = function (len) {
	var t = [], i;
	for (i = 0; i < len; i++) {
		t.push(' ');
	}
	return t.join('');
};
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key) && key != '$$hashKey') size++;
	}
	return size;
};

var app = angular.module("jsooner", ['ui.codemirror']);

app.directive('collection', function () {
	return {
		restrict: "E",
		replace: true,
		scope: {
			collection: '=',
			show:"="
		},
		template: '<ul><member ng-repeat="(name,value) in collection | orderBy:$index" member="{name:name,value:value}"></member></ul>',
		link: function (scope, element, attrs) {
		}
	}
})

	.directive('member', function ($compile) {
		return {
			restrict: "E",
			replace: true,
			scope: {
				member: '='
			},
			template: '<li><i class="fa fa-minus-square" ng-show="!primitive" ng-click="toggleShow()"></i><div class="icon icon-{{getType()}}"  ></div><span>{{member.name}}:</span></li>',
			link: function (scope, element, attrs) {
				var collectionSt = '<span class="size" ng-show="getSize()>-1"> {{getSizeText()}}</span><span class="type">[{{getType()}}]</span><collection collection="member.value"></collection>';
				var primitiveTemplate = '<span class="{{getType()}}"> {{member.value}} </span><span class="type">[{{getType()}}]</span>';
				scope.primitive = false;

				if (_.isArray(scope.member.value) || _.isObject(scope.member.value)) {
					console.log("array,object",scope.member.value);
					$compile(collectionSt)(scope, function(cloned, scope)   {
						console.log(element.find(".child"));
						element.append(cloned);
					});
				}else{
					console.log("primitive",scope.member.value);
					scope.primitive = true;
					$compile(primitiveTemplate)(scope, function(cloned, scope)   {
						element.append(cloned);
					})
				}

				scope.getType = function(){
					if(_.isArray(scope.member.value))
						return "array";
					else if(_.isNumber(scope.member.value))
						return "number";
					else if(_.isString(scope.member.value))
						return "string";
					else if(_.isBoolean(scope.member.value))
						return "boolean";
					else
						return "object";

				}
				scope.getSize = function(){
					if(_.isArray(scope.member.value))
						return scope.member.value.length;
					else if(_.isObject(scope.member.value))
						return Object.size(scope.member.value);
					return -1;
				}
				scope.getSizeText = function(){
					if(_.isArray(scope.member.value))
						return "["+scope.member.value.length+"]";
					else if(_.isObject(scope.member.value)){


					console.log(scope.member.value);
						return "{"+Object.size(scope.member.value)+"}";
					}
					else
						return "";
				}
				scope.show = true;
				scope.toggleShow = function(){
					element.find("i").toggleClass("fa-plus-square");
					element.find("i").toggleClass("fa-minus-square");
					element.find("ul").toggleClass("hide");
				}
			}
		}
	})

app.controller("ViewerController", function ($scope) {

	$scope.editorOptions = {
		lineWrapping : true,
		lineNumbers: true,
		mode: "application/json",
		theme:"mbo",
		lint:true,
		styleActiveLine: true,
		matchBrackets: true,
		mime:"application/json",
		gutters: ["CodeMirror-lint-markers"],
	};

	$scope.data = {
		"jsooner": "visualize JSON faster",
		"forkme": "https://github.com/markov00/jsooner.git",
		"likeit": true,
		"version": 0.1,
		"credits": [
			{
				"angularjs": "https://github.com/zaach/jsonlint"
			},
			{
				"codemirror": "https://github.com/zaach/jsonlint"
			},
			{
				"jsonlint": "http://jsonlint.com"
			},
			{
				"jsonviewer": "http://jsonviewer.stack.hu"
			},
			{
				"nasted directives": "http://sporto.github.io"
			}
		]
	};

	$scope.text= JSON.stringify($scope.data);


	$scope.error = false;
	$scope.$watch('text',function(text){
		if(!text)
			return;
		try{
			$scope.data = JSON.parse(text);
		}catch(err){
		}
	},true);

	$scope.format = function () {
		var text = $scope.text.replace(/\n/g, ' ').replace(/\r/g, ' ');
		var t = [];
		var tab = 0;
		var inString = false;
		for (var i = 0, len = text.length; i < len; i++) {
			var c = text.charAt(i);
			if (inString && c === inString) {
				// TODO: \\"
				if (text.charAt(i - 1) !== '\\') {
					inString = false;
				}
			} else if (!inString && (c === '"' || c === "'")) {
				inString = c;
			} else if (!inString && (c === ' ' || c === "\t")) {
				c = '';
			} else if (!inString && c === ':') {
				c += ' ';
			} else if (!inString && c === ',') {
				c += "\n" + String.space(tab * 2);
			} else if (!inString && (c === '[' || c === '{')) {
				tab++;
				c += "\n" + String.space(tab * 2);
			} else if (!inString && (c === ']' || c === '}')) {
				tab--;
				c = "\n" + String.space(tab * 2) + c;
			}
			t.push(c);
		}
		$scope.text = t.join('');
	};

	$scope.compact =  function () {
		var text = $scope.text.replace(/\n/g, ' ').replace(/\r/g, ' ');
		var t = [];
		var inString = false;
		for (var i = 0, len = text.length; i < len; i++) {
			var c = text.charAt(i);
			if (inString && c === inString) {
				// TODO: \\"
				if (text.charAt(i - 1) !== '\\') {
					inString = false;
				}
			} else if (!inString && (c === '"' || c === "'")) {
				inString = c;
			} else if (!inString && (c === ' ' || c === "\t")) {
				c = '';
			}
			t.push(c);
		}
		$scope.text = t.join('');
	};
	$scope.format();


});