chrome.action.onClicked.addListener((tab) => {
  // Inject the library and our script directly into the page's execution environment
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["jspdf.umd.min.js", "content.js"],
    world: "MAIN" 
  });
});