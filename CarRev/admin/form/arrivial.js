document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch data from the API
  async function fetchData() {
    try {
      const response = await fetch(
        "http://localhost:5001/buildings/:buildingId/accepted-sessions"
      );
      const data = await response.json();
      return data.data.acceptedSessions;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }
  async function arriveButtonClick(sessionId, buttonElement) {
    console.log("Button clicked for session ID:", sessionId);

    const apiUrl = `http://localhost:5000/api/v1/sessions/${sessionId}`;
    const systemTime = new Date().toISOString(); // Get the current system time
    // const sessionId = $(this).data("session-id");

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          arrival_time: systemTime,
          session_id: sessionId,
          // Ending time is set to null
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Arrival successful:", result.data.booking);
        // Remove the corresponding card from the DOM
        removeCard(buttonElement);
      } else {
        console.error("Arrival failed:", result.message);
        // Handle the case where the arrival fails
      }
    } catch (error) {
      console.error("Error during arrival:", error);
      // Handle the case where an error occurs during the arrival process
    }
  }

  // Function to remove the corresponding card from the DOM
  function removeCard(buttonElement) {
    const customCard = buttonElement.closest(".col-3");
    if (customCard) {
      customCard.remove();
    }
  }

  // Function to update the accepted list with the fetched data
  async function updateAcceptedList() {
    const acceptedSessions = await fetchData();
    const acceptedListContainer = document.getElementById("adminAcceptedList");

    // Clear existing content
    acceptedListContainer.innerHTML = "";

    // Populate the accepted list with the fetched data
    acceptedSessions.forEach((session) => {
      const customCard = document.createElement("div");
      customCard.className = "col-3";
      customCard.innerHTML = `
        <div class="custom-card">
                   <b>${session.owner_name}  [ID:${session.customer_id} ]</b><br />
                   Book Time: ${session.book_time} <br />
                  Building : ${session.building_name}, Slot : ${session.slot_id} <br />
                  Car Info: ${session.car_info} [ID:${session.car_id}]  <br />
               
                 Phone No: ${session.customer_ph_no}<br/>
                 <div style="padding-top: 10px ">
                 <button class="btn btn-primary" data-session-id="${session.session_id}">Arrive</button>
            </div>
          </div>
        `;
      acceptedListContainer.appendChild(customCard);
      const arriveButton = customCard.querySelector(".btn-primary");
      arriveButton.addEventListener("click", (event) => {
        const sessionId = event.target.getAttribute("data-session-id");
        arriveButtonClick(sessionId, event.target);
      });
    });
  }

  // Function to handle the Arrive button click

  // Function to update the accepted list at regular intervals (e.g., every 5 seconds)
  function updatePeriodically() {
    setInterval(updateAcceptedList, 500); // Adjust the interval as needed (in milliseconds)
  }

  // Call the initial updateAcceptedList function when the page is loaded
  updateAcceptedList();

  // Start updating the accepted list periodically
  updatePeriodically();
});
