// Stack Chat iFrame Injection
function injectStackChat(){
  var iFrame  = document.createElement("iframe");
  iFrame.src  = chrome.extension.getURL("views/chat_panel.html");
  iFrame.setAttribute("frameBorder","0");
  iFrame.id = "stackchat-iframe";
  iFrame.style.cssText = "position: fixed; top: 0px; right: 0; width: 300px; z-index: 1000;";
  iFrame.style.height = window.innerHeight + "px";
  document.body.insertBefore(iFrame, document.body.firstChild);
  // Handle window resizing
  window.addEventListener('resize', resizeFrame, false);
  function resizeFrame() {
    iFrame.style.height = window.innerHeight + "px";
  }
}

var existingPanel = document.getElementById("stackchat-iframe");
if(existingPanel){
  document.body.removeChild(existingPanel);
} else injectStackChat();