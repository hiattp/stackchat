// Inject StackChat iFrame
window.onload = function(){
  var iFrame  = document.createElement("iframe");
  iFrame.src  = "chat_panel.html"; // chrome.extension.getURL ("chat_panel.html");
  iFrame.setAttribute("frameBorder","0");
  iFrame.id = "stackchat-iframe";
  iFrame.style.cssText = "position: fixed; top: 0px; right: 0; width: 300px;";
  iFrame.style.height = window.innerHeight + "px";
  document.body.insertBefore (iFrame, document.body.firstChild);
  // Handle window resizing
  window.addEventListener('resize', resizeFrame, false);
  function resizeFrame() {
    iFrame.style.height = window.innerHeight + "px";
  }
}
