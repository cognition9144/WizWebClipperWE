var app = angular.module('wizWebClipper', ['ngTagsInput', 'nya.bootstrap.select']);

var CONST = Wiz.Constant;

$('tags-input').attr('placeholder', chrome.i18n.getMessage('tag_input'));

app.controller('ClipperCtrl', function($scope) {
    //tags
    $scope.tags = [];

    $scope.tagsNameStr = function() {
        var length = $scope.tags.length;
        var result = '';
        if (length > 0) {
            for (var i = 0; i < length - 1; i++) {
                result += $scope.tags[i].text + ',';
            }
            result += $scope.tags[i].text;

        }
        return result;
    };

    $scope.loadTags = function($query) {
        var promise = new Promise(function(resolve, reject) {
            var tags = localStorage[CONST.COOKIE.TAG];
            tags = tags ? tags.split(',') : [];
            resolve(tags);
        });
        return promise.then(function(tags) {
            return tags.filter(function(tag) {
                return tag.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        });
    };

    //submit-type
    $scope.submitType = 'article';
    $scope.$watch('submitType', function(){
        $('#submit-type').trigger('change');
    });

    //save-type
    $scope.saveType = 'save_to_server';
    $scope.$watch('saveType', function(){
        $('#save_type_sel').trigger('change');
    });
});