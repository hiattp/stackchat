var stackchat = 
  angular.module('stackchat', []);

stackchat.controller('ChatCtrl', ['$scope',
    function($scope){
      var messages = []
      $scope.msg = "";
      $scope.anon = false;
      for(i=0;i<20;i++) messages.push({body: "This is a long message!", username: "hiattp"})
      messages.push({body: "this is the last message and I really appreciate the opportuntiy to do this."});
      $scope.messages = messages;
      var added = 0;
      $scope.addMessage = function(e) {
        if(e.keyCode && e.keyCode != 13) return;
        e.preventDefault();
        if($scope.msg == 0) return;
        var msg = {body: $scope.msg};
        if(!$scope.anon) msg.username = added >= 3 ? "hiattp" : "tester";
        $scope.messages.push(msg);
        added += 1;
        $scope.msg = "";
      }
}]);