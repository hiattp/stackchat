var questionUrlMatch = /stackoverflow\.com\/questions\/(\d+)\//i.exec(window.location.href)
  , iFrameName = questionUrlMatch ? "stackchat-iframe-" + questionUrlMatch[1] : "stackchat-iframe";

// Stack Chat iFrame Injection
function injectStackChat(){
  var iFrame  = document.createElement("iframe");
  iFrame.src  = chrome.extension.getURL("views/chat_panel.html");
  iFrame.setAttribute("frameBorder","0");
  iFrame.id = iFrameName;
  iFrame.style.cssText = "position: fixed; top: 0px; right: 0; width: 300px; z-index: 10000;";
  iFrame.style.height = window.innerHeight + "px";
  document.body.insertBefore(iFrame, document.body.firstChild);
  // Handle window resizing
  window.addEventListener('resize', resizeFrame, false);
  function resizeFrame() {
    iFrame.style.height = window.innerHeight + "px";
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.action == "open"){
    if(!document.getElementById(iFrameName)) injectStackChat();
  }
  return true;
});

injectStackChat();

// Message handlers

addEventListener("message", function(event) {
  if (event.origin + "/views/chat_panel.html" == chrome.extension.getURL("views/chat_panel.html")){
    console.log("Received message from chat panel:", event);
    if(event.data.message == "action:exit"){
      var existingPanel = document.getElementById(iFrameName);
      if(existingPanel) document.body.removeChild(existingPanel);
    }
  }
}, false);