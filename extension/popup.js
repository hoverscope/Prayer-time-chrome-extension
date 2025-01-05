// popup.js
document.addEventListener("DOMContentLoaded", function () {
  // Update the current date and time dynamically
  function updateCurrentDateTime() {
    const currentTimeElement = document.querySelector("#current-time");
    const currentDateElement = document.querySelector("#current-date");

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDate = now.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });

    if (currentTimeElement) currentTimeElement.textContent = formattedTime;
    if (currentDateElement) currentDateElement.textContent = formattedDate;
  }

  // Update Hijri date
  function updateHijriDate() {
    const hijriDate = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric'
    }).format(Date.now());

    const hijriDateElement = document.querySelector("#hijri-date");
    if (hijriDateElement) hijriDateElement.textContent = hijriDate;
  }

 

  function updateCurrentPrayerDisplay(timings) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    let currentPrayer = null;

    // Convert prayer times to minutes and sort them
    const prayerTimes = Object.entries(timings).map(([prayer, time]) => {
        const [hours, minutes] = time.split(':');
        return {
            prayer,
            timeInMinutes: parseInt(hours) * 60 + parseInt(minutes)
        };
    }).sort((a, b) => a.timeInMinutes - b.timeInMinutes);

    // Find current prayer by checking if current time is between prayer times
    for (let i = 0; i < prayerTimes.length; i++) {
        const currentPrayerTime = prayerTimes[i].timeInMinutes;
        const nextPrayerTime = prayerTimes[i + 1]?.timeInMinutes || (24 * 60); // Use 24:00 if it's the last prayer

        if (currentTime >= currentPrayerTime && currentTime < nextPrayerTime) {
            currentPrayer = prayerTimes[i].prayer;
            break;
        }
    }

    // If no prayer is found (before first prayer of the day), use the last prayer from previous day
    if (!currentPrayer && currentTime < prayerTimes[0].timeInMinutes) {
        currentPrayer = prayerTimes[prayerTimes.length - 1].prayer;
    }

    const pNameElement = document.querySelector(".p_name");
    if (pNameElement && currentPrayer) {
        pNameElement.textContent = currentPrayer;
    }
}

function updatePrayerTimesUI(timings) {
  const prayerRows = document.querySelectorAll(".prayer-row");
  prayerRows.forEach(row => {
      const prayerName = row.querySelector(".prayer-name-time span:first-child").textContent.trim();
      const prayerTime = timings[prayerName];
      if (prayerTime) {
          row.querySelector(".prayer-name-time span:last-child").textContent = prayerTime;
      }
  });

  // Update current prayer display instead of next prayer
  updateCurrentPrayerDisplay(timings);
}

  // Set interval to update time every second
  setInterval(updateCurrentDateTime, 1000);
  updateCurrentDateTime(); // Initial update
  updateHijriDate(); // Initial Hijri date update

  // Get prayer times from background script
  chrome.runtime.sendMessage({ type: 'getPrayerTimes' }, response => {
    if (response.error) {
      const errorMessageElement = document.querySelector("#error-message");
      if (errorMessageElement) {
        errorMessageElement.textContent = "Failed to load prayer times. Please try again later.";
      }
      return;
    }

    if (response.prayerTimes) {
      updatePrayerTimesUI(response.prayerTimes);
    }
  });
});