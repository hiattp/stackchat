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
      $scope.$on("auth:login", function(e,data){
        fbRootRef.auth(data.userData.firebaseAuthToken, function(err){
          if(err) console.log('login failed'); // handle this
          else{
            $scope.$apply(function(){
              $scope.user = data.userData;
            });
          }
        });
      });
      
      $scope.logout = function() {
        fbRootRef.unauth();
        $scope.user = null;
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

function eventBus(eventName, args){
  angular.element(document.body).scope().$emit(eventName, args);
}

// consider moving all this so don't need event listener and bus...should be able to go straight 
// to parent frame from child with this event and data.
addEventListener("message", function(event) {
  if(event.origin == "http://hiattp.github.io"){
    if(event.data.message == "auth:login") eventBus("auth:login", {userData: event.data.userData})
  }
}, false);