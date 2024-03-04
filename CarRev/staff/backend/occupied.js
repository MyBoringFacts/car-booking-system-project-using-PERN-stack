document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch data from the API
  async function fetchData() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/buildings/1/occupied-sessions"
      );
      const data = await response.json();
      return data.data.acceptedSessions;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }
  async function termanationButtonClick(sessionId, buttonElement) {
    console.log("Button clicked for session ID:", sessionId);

    const apiUrl = `http://localhost:5000/api/v1/sessions/${sessionId}/terminate`;
    const systemTime = new Date(); // Use the current system time directly without converting to ISO string

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          end_time: systemTime.toISOString(), // Convert systemTime to ISO string
          session_id: sessionId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Termination successful:", result.data.booking);
        // Remove the corresponding card from the DOM
        removeCard(buttonElement);
      } else {
        console.error("Termination failed:", result.message);
        // Handle the case where the termination fails
      }
    } catch (error) {
      console.error("Error during Termination:", error);
      // Handle the case where an error occurs during the termination process
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
    const acceptedListContainer = document.getElementById("occupiedLists");

    // Clear existing content
    acceptedListContainer.innerHTML = "";

    // Populate the accepted list with the fetched data
    acceptedSessions.forEach((session) => {
      const customCard = document.createElement("div");
      customCard.className = "col-3";
      customCard.innerHTML = `
        <div class="custom-card">
                   <b>${session.owner_name}  [ID:${session.customer_id} ]</b><br />
                   Book Time: ${session.start_time} <br />
                   Arrival Time: ${session.arrival_time} <br />
                  Slot : ${session.slot_id} <br />
                  Car Info: ${session.car_info} [ID:${session.car_id}]  <br />
               
                 Phone No: ${session.customer_ph_no}<br/>
                 <div style="padding-top: 10px ">
                 <button class="btn btn-danger" data-session-id="${session.session_id}">Terminate Session</button>
            </div>
          </div>
        `;
      acceptedListContainer.appendChild(customCard);
      const leaveButton = customCard.querySelector(".btn-danger");
      leaveButton.addEventListener("click", (event) => {
        const sessionId = event.target.getAttribute("data-session-id");
        termanationButtonClick(sessionId, event.target);
      });
    });
  }

  // Function to handle the Arrive button click

  // Function to update the accepted list at regular intervals (e.g., every 5 seconds)
  function updatePeriodically() {
    setInterval(updateAcceptedList, 5000); // Adjust the interval as needed (in milliseconds)
  }

  // Call the initial updateAcceptedList function when the page is loaded
  updateAcceptedList();

  // Start updating the accepted list periodically
  updatePeriodically();
});
