var autoOpen = false;

chrome.browserAction.onClicked.addListener(function(tab) {
  var onSO = /stackoverflow\.com\//i.exec(tab.url);
  if(onSO) chrome.tabs.sendMessage(tab.id, {action: "open"}, function(res){
    if(!res){ // rescue if extension was just installed and content script wasn't injected
      autoOpen = true;
      chrome.tabs.update(tab.id, {url: tab.url});
    }
  });
  else{
    autoOpen = true;
    chrome.tabs.update(tab.id, {url:"http://stackoverflow.com/"});
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.action == "readVar:autoOpen"){
    sendResponse({autoOpen:autoOpen});
    autoOpen = false;
  } else if(request.action == "setVar:autoOpen"){
    autoOpen = true;
  } else if(request.action == "setBadge"){
    chrome.browserAction.setBadgeText({ text: request.displayText });
  } else if(request.action == "clearBadge"){
    chrome.browserAction.setBadgeText({ text: "" });
  }
  return true;
});