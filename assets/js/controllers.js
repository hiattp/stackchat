var stackchat = 
  angular.module('stackchat', ['firebase']).
  constant('firebaseRootUrl', "https://stackchat-test.firebaseIO.com").
  factory('fbRootRef', ['firebaseRootUrl', function(fbRootUrl){
    return new Firebase(fbRootUrl)
  }]);

stackchat.controller('ChatCtrl', ['$scope', '$window', 'fbRootRef', 'angularFireAuth', 'angularFireCollection',
    function($scope, $window, fbRootRef, angularFireAuth, angularFireCollection){
      // Setup vars
      $scope.msg = "";
      $scope.anon = false;
      var questionId = $window.name.split("-")[2]
      , messagesRef = fbRootRef.child('messages')
      , questionMessageIndex, userMessageIndex;
      
      if(questionId){
        questionMessageIndex = new FirebaseIndex(fbRootRef.child('questions/'+questionId+"/message_list"), messagesRef);
        $scope.messages = angularFireCollection(questionMessageIndex.limit(20));
        $scope.onQuestionPage = true;
      } else {
        $scope.messages = angularFireCollection(messagesRef.limit(20));
        $scope.onQuestionPage = false;
      }
      
      // Auth
      $scope.$on("auth:login", function(e,data){
        fbRootRef.auth(data.userData.firebaseAuthToken, function(err){
          if(err) console.log('login failed'); // handle this
          else{
            $scope.$apply(function(){
              $scope.user = data.userData;
              userMessageIndex = new FirebaseIndex(fbRootRef.child('users/'+$scope.user.uid+"/message_list"), messagesRef);
            });
          }
        });
      });
      
      $scope.logout = function() {
        fbRootRef.unauth();
        $scope.user = null;
        userMessageIndex = null;
        childMessageBus("action:logout");
      };
      
      // Chat Message Actions - prevent double submits
      $scope.addMessage = function(e) {
        if(e.keyCode && e.keyCode != 13) return;
        e.preventDefault();
        if($scope.msg == 0) return;
        var newMsg = {body: $scope.msg, createdAt: Date.now(), questionId: questionId, userId: $scope.user.uid};
        if(!$scope.anon) newMsg.username = $scope.user.username;
        var id = messagesRef.push();
        id.set(newMsg, function(err){
          if(!err){
            $scope.msg = "";
            questionMessageIndex.add(id.name());
            userMessageIndex.add(id.name());
          }
        });
      }
      
      // General Actions
      $scope.exitStackChat = function(){
        parentMessageBus("action:exit");
      }
      $scope.globalKeypress = function(e){
        if(e.keyCode == 27){
          $scope.exitStackChat();
          return;
        }        
      }
}]);

function parentMessageBus(msg){
  window.parent.postMessage({
    message: msg
  }, "*");
}

function childMessageBus(msg){
  document.getElementById('auth-frame').contentWindow.postMessage({
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