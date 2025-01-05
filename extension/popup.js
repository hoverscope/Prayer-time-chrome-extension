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

          // Function to get the current prayer based on current time
          function getCurrentPrayer() {
              const now = new Date();
              const prayers = Object.entries(prayerMapping);

              for (let i = 0; i < prayers.length; i++) {
                  const [prayer, time] = prayers[i];
                  const [hours, minutes] = time.split(":");
                  const prayerTime = new Date();
                  prayerTime.setHours(hours, minutes, 0, 0);

                  if (prayerTime > now) {
                      return prayers[i - 1] ? prayers[i - 1][0] : "Isha"; // Return the previous prayer or Isha if none
                  }
              }
              return "Isha"; // If all prayers have passed, it's Isha time
          }

          // Update the current prayer name
          function updatePrayerDisplay() {
              const pNameElement = document.querySelector(".p_name");
              const currentPrayer = getCurrentPrayer();
              if (pNameElement && currentPrayer) {
                  pNameElement.textContent = currentPrayer;
              }
          }

          // Map prayer times to UI
          prayerRows.forEach(row => {
              const prayerName = row.querySelector(".prayer-name-time span:first-child").textContent.trim();
              const prayerTime = prayerMapping[prayerName];
              if (prayerTime) {
                  row.querySelector(".prayer-name-time span:last-child").textContent = prayerTime;
              }
          });

          // Update the prayer display every minute
          updatePrayerDisplay();
          setInterval(updatePrayerDisplay, 60000); // Check every minute
      })
      .catch(error => {
          console.error("Error fetching prayer times:", error);
          const errorMessageElement = document.querySelector("#error-message");
          if (errorMessageElement) {
              errorMessageElement.textContent = "Failed to load prayer times. Please try again later.";
          }
      });
});
