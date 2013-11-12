var showBadge = true
  , questionUrlMatch = /stackoverflow\.com\/questions\/(\d+)\//i.exec(window.location.href)
  , iFrameName = questionUrlMatch ? "stackchat-iframe-" + questionUrlMatch[1] : "stackchat-iframe";

// Stack Chat iFrame Injection
function injectStackChat(){
  var iFrame  = document.createElement("iframe");
  iFrame.src  = chrome.extension.getURL("views/chat_panel.html");
  iFrame.setAttribute("frameBorder","0");
  iFrame.id = iFrameName;
  iFrame.style.cssText = "position: fixed; top: 0px; right: -300px; width: 300px; z-index: 10000;";
  iFrame.style.height = window.innerHeight + "px";
  document.body.insertBefore(iFrame, document.body.firstChild);
  $(iFrame).animate({right: 0});
  // Handle window resizing
  window.addEventListener('resize', resizeFrame, false);
  function resizeFrame() {
    iFrame.style.height = window.innerHeight + "px";
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.action == "open"){
    if(!document.getElementById(iFrameName)){
      clearBadge();
      injectStackChat();
    }
    sendResponse({success: true});
  }
  return true;
});

chrome.runtime.sendMessage({action: "readVar:autoOpen"}, function(response) {
  if(response.autoOpen){
    clearBadge();
    injectStackChat();
  }
  else renderNumMessagesBadge();
});

// Browser Action Badge Actions

function renderNumMessagesBadge(){
  chrome.runtime.sendMessage({action: "setBadge", displayText: ""});
  if(!questionUrlMatch) return;
  var numMessages = 0
    , questionMessagesRef = new Firebase("https://stackchat.firebaseIO.com/questions/"+questionUrlMatch[1]+"/message_list");
  questionMessagesRef.on('child_added', function(ss) {
    numMessages += 1;
    var displayText = numMessages > 99 ? "99+" : numMessages.toString();
    if(showBadge) chrome.runtime.sendMessage({action: "setBadge", displayText: displayText});
  });
}

function clearBadge(){
  showBadge = false;
  chrome.runtime.sendMessage({action: "clearBadge"});
}

// Inter-iFrame Messaging and Events

addEventListener("message", function(event) {
  if (event.origin + "/views/chat_panel.html" == chrome.extension.getURL("views/chat_panel.html")){
    // console.log("Received message from chat panel:", event);
    if(event.data.message == "action:exit"){
      var existingPanel = document.getElementById(iFrameName);
      if(existingPanel){
        $(existingPanel).animate({right: -300}, function(){
          document.body.removeChild(this);
        })
      }
    } else if(event.data.message == "action:redirect"){
      chrome.runtime.sendMessage({action: "setVar:autoOpen"});
      window.location.href = event.data.args.newLocation;
    }
  }
}, false);

// Test for external link clicks. If external, clear badge before navigating.
var hostRegex = new RegExp("//" + window.location.host + "($|/)");
$(document).on("click", "a", function(e){
  var href = $(this).attr("href") || "";
  var isLocal = (href.substring(0,4) === "http") ? hostRegex.test(href) : true;
  if(!isLocal) clearBadge();
});