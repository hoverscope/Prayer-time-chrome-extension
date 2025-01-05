chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");

  // Send a notification when the extension is installed
  showNotification("Extension Installed!", "Your extension is now active and ready.");
});

// Function to show a notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png", // Ensure this path points to a valid icon file
    title: title,
    message: message
  });
}
