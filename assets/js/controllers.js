var stackchat = 
  angular.module('stackchat', ['firebase']).
  constant('firebaseRootUrl', "https://stackchat-test.firebaseIO.com").
  factory('fbRootRef', ['firebaseRootUrl', function(fbRootUrl){
    return new Firebase(fbRootUrl)
  }]);

stackchat.controller('ChatCtrl', ['$scope', '$window', 'fbRootRef', 'angularFireAuth', 'angularFireCollection',
    function($scope, $window, fbRootRef, angularFireAuth, angularFireCollection){
      // Setup vars
      $scope.messages = angularFireCollection(fbRootRef.child('messages'));
      $scope.msg = "";
      $scope.anon = false;
      var questionId = $window.name.split("-")[2];
      
      // Auth
      angularFireAuth.initialize(fbRootRef, {scope: $scope, name: "user"});
      $scope.login = function() {
        angularFireAuth.login("github", {
          rememberMe: true
        });
      };
      $scope.logout = function() {
        angularFireAuth.logout();
      };
      
      // Chat Messages
      $scope.addMessage = function(e) {
        if(e.keyCode == 27){
          $scope.exitStackChat();
          return;
        }
        if(e.keyCode && e.keyCode != 13) return;
        e.preventDefault();
        if($scope.msg == 0) return;
        var msg = {body: $scope.msg};
        if(!$scope.anon) msg.username = "hiattp";
        // $scope.messages.push(msg);
        $scope.msg = "";
      }
      
      // General Actions
      $scope.exitStackChat = function(){
        windowMessageBus("action:exit");
      }
}]);

function windowMessageBus(msg){
  window.parent.postMessage({
    message: msg
  }, "*");
}