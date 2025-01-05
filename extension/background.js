let prayerTimes = {};

// Function to show a notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message
  });
}

// Function to fetch prayer times
async function fetchPrayerTimes() {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const apiUrl = `https://api.aladhan.com/v1/timingsByCity/${formattedToday}?city=Dubai&country=UAE`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch prayer times");
    const data = await response.json();
    prayerTimes = {
      Fajr: data.data.timings.Fajr,
      Shurooq: data.data.timings.Sunrise,
      Dhur: data.data.timings.Dhuhr,
      Asr: data.data.timings.Asr,
      Maghrib: data.data.timings.Maghrib,
      Isha: data.data.timings.Isha,
    };
    checkPrayerTimes();
    return prayerTimes;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error;
  }
}

// Function to check if it's time for prayer
function checkPrayerTimes() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  Object.entries(prayerTimes).forEach(([prayer, time]) => {
    const [hours, minutes] = time.split(':');
    const prayerTimeInMinutes = parseInt(hours) * 60 + parseInt(minutes);
    
    // Check if we're within 1 minute of prayer time
    if (Math.abs(currentTime - prayerTimeInMinutes) <= 1) {
      showNotification("Prayer Time", `It's time for ${prayer} prayer`);
    }
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getPrayerTimes') {
    // If we already have prayer times for today, send them
    if (Object.keys(prayerTimes).length > 0) {
      sendResponse({ prayerTimes });
    } else {
      // If we don't have prayer times, fetch them
      fetchPrayerTimes()
        .then(times => sendResponse({ prayerTimes: times }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Will respond asynchronously
    }
  }
});

// When extension is installed
chrome.runtime.onInstalled.addListener(() => {
  showNotification("Extension Installed!", "Prayer times notifications are now active.");
  fetchPrayerTimes();
  
  // Create alarm to fetch prayer times daily at midnight
  chrome.alarms.create('fetchPrayerTimes', {
    periodInMinutes: 1440 // 24 hours
  });
  
  // Create alarm to check prayer times every minute
  chrome.alarms.create('checkPrayerTimes', {
    periodInMinutes: 1
  });
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchPrayerTimes') {
    fetchPrayerTimes();
  } else if (alarm.name === 'checkPrayerTimes') {
    checkPrayerTimes();
  }
});

// Initial fetch
fetchPrayerTimes();
