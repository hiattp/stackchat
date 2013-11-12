var stackchat = 
  angular.module('stackchat', ['firebase']).
  constant('firebaseRootUrl', "https://stackchat.firebaseIO.com").
  factory('fbRootRef', ['firebaseRootUrl', function(fbRootUrl){
    return new Firebase(fbRootUrl)
  }]);

stackchat.controller('ChatCtrl', ['$scope', '$window', 'fbRootRef', 'angularFireCollection',
    function($scope, $window, fbRootRef, angularFireCollection){
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
      
      // Chat Message Actions
      $scope.addMessage = function(e) {
        if(e.keyCode && e.keyCode != 13) return;
        e.preventDefault();
        if($scope.msg == 0 || $scope.savingMessage) return;
        $scope.savingMessage = true;
        var newMsg = {body: $scope.msg, createdAt: Date.now(), questionId: questionId, userId: $scope.user.uid};
        if(!$scope.anon) newMsg.username = $scope.user.username;
        var id = messagesRef.push();
        id.set(newMsg, function(err){
          $scope.savingMessage = false;
          if(!err){
            $scope.msg = "";
            questionMessageIndex.add(id.name());
            userMessageIndex.add(id.name());
          }
        });
      }
      
      $scope.redirectToQuestion = function(questionId){
        if($scope.onQuestionPage) return;
        parentMessageBus("action:redirect", {newLocation: "http://stackoverflow.com/questions/"+questionId});
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

// Inter-iFrame Messaging and Events

// Pass messages to injector (content) script
function parentMessageBus(msg, args){
  window.parent.postMessage({
    message: msg,
    args: args
  }, "*");
}

// Pass messages to auth frame (hosted on gh-pages)
function childMessageBus(msg){
  document.getElementById('auth-frame').contentWindow.postMessage({
    message: msg
  }, "*");
}

// Translate received messages into angular events
function eventBus(eventName, args){
  angular.element(document.body).scope().$emit(eventName, args);
}

// Listen for messages from other frames
addEventListener("message", function(event) {
  if(event.origin == "http://hiattp.github.io"){
    if(event.data.message == "auth:login") eventBus("auth:login", {userData: event.data.userData})
  }
}, false);

// Listen for resizing and adjust the chat ul appropriately
window.addEventListener('resize', resizeChatWrapper, false);
function resizeChatWrapper(){
  $(".main-content").height($(document).height() - 163);
  // iFrame.style.height = window.innerHeight + "px";
}
$(function(){
  resizeChatWrapper()
});