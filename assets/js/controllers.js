var stackchat = 
  angular.module('stackchat', ['firebase']).
  constant('firebaseRootUrl', "https://stackchat-test.firebaseIO.com").
  factory('fbRootRef', ['firebaseRootUrl', function(fbRootUrl){
    return new Firebase(fbRootUrl)
  }]);

stackchat.controller('ChatCtrl', ['$scope', '$window', 'fbRootRef', 'angularFireCollection',
    function($scope, $window, fbRootRef, angularFireCollection){
      // Setup vars
      $scope.messages = angularFireCollection(fbRootRef.child('messages'));
      $scope.msg = "";
      $scope.anon = false;
      var questionId = $window.name.split("-")[2];
      // for(i=0;i<20;i++) messages.push({body: "This is a long message!", username: "hiattp"})
      // messages.push({body: "this is the last message and I really appreciate the opportuntiy to do this."});
      // $scope.messages = messages;
      
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
      
      $scope.exitStackChat = function(){
        windowMessageBus("action:exit");
      }
}]);

function windowMessageBus(msg){
  window.parent.postMessage({
    message: msg
  }, "*");
}