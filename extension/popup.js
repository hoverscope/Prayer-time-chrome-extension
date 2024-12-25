document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const apiUrl = `https://api.aladhan.com/v1/timingsByCity/${formattedToday}?city=Sharjah&country=UAE`;
  
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
  
    // Set interval to update time every second
    setInterval(updateCurrentDateTime, 1000);
    updateCurrentDateTime(); // Initial update
    updateHijriDate(); // Initial Hijri date update
  
    // Fetch prayer times from the API
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch prayer times.");
        }
        return response.json();
      })
      .then(data => {
        const timings = data.data.timings;
  
        // Map API timings to UI
        const prayerMapping = {
          Fajr: timings.Fajr,
          Shurooq: timings.Sunrise,
          Dhur: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha,
        };
  
        const prayerRows = document.querySelectorAll(".prayer-row");
        
        // Function to get the next prayer based on current time
        function getNextPrayer(currentTime) {
          const prayers = Object.entries(prayerMapping);
          for (let i = 0; i < prayers.length; i++) {
            const [prayer, time] = prayers[i];
            const prayerTime = new Date(`1970-01-01T${time}:00Z`);
            if (prayerTime > currentTime) {
              return prayer;
            }
          }
          return null; // If no prayer is found (this case occurs when we reach the last prayer of the day)
        }
  
        // Get current time
        const currentTime = new Date();
  
        // Find the next prayer
        const nextPrayer = getNextPrayer(currentTime);
  
        // Update the p_name based on the next prayer
        const pNameElement = document.querySelector(".p_name");
        if (pNameElement && nextPrayer) {
          pNameElement.textContent = nextPrayer;
        }
  
        // Map prayer times to UI
        prayerRows.forEach(row => {
          const prayerName = row.querySelector(".prayer-name-time span:first-child").textContent.trim();
          const prayerTime = prayerMapping[prayerName];
          if (prayerTime) {
            row.querySelector(".prayer-name-time span:last-child").textContent = prayerTime;
          }
        });
      })
      .catch(error => {
        console.error("Error fetching prayer times:", error);
        const errorMessageElement = document.querySelector("#error-message");
        if (errorMessageElement) {
          errorMessageElement.textContent = "Failed to load prayer times. Please try again later.";
        }
      });
  });
