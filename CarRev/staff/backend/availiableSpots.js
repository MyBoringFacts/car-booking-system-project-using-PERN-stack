// document.addEventListener("DOMContentLoaded", function () {
//   const apiEndpoint = "http://localhost:5000/api/v1/buildings";
//   const slotsEndpoint = `${apiEndpoint}/slotsDetails`;
//   const addSlotsEndpoint = `${apiEndpoint}/1/addslots`;

//   // Fetch data from the API
//   const fetchData = () => {
//     fetch(slotsEndpoint)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         updateUI(data);
//       })
//       .catch((error) => {
//         handleAPIError(error);
//       });
//   };

//   // Function to update the UI with available slots data
//   const updateUI = (data) => {
//     const slotsContainer = document.getElementById("availiableSlots");
//     slotsContainer.innerHTML = "";

//     if (data.status === "success" && data.data.availableSessions.length > 0) {
//       const totalSlots = data.data.availableSessions.length;
//       const slotsPerRow = 4;

//       const slotsHeader = document.createElement("h2");
//       slotsHeader.textContent = `Total Available Slots: ${totalSlots}`;
//       slotsContainer.appendChild(slotsHeader);

//       for (let i = 0; i < totalSlots; i += slotsPerRow) {
//         const row = document.createElement("div");
//         row.className = "row mb-3";

//         for (let j = 0; j < slotsPerRow && i + j < totalSlots; j++) {
//           const card = createSlotCard(data.data.availableSessions[i + j]);
//           row.appendChild(card);
//         }

//         slotsContainer.appendChild(row);
//       }

//       // If there are more slots, add the "+" button after the last slot
//       if (totalSlots > slotsPerRow) {
//         const lastRow = slotsContainer.lastChild;
//         const addButton = createAddButton();
//         lastRow.appendChild(addButton);
//       }
//     } else {
//       // Display a dummy message if there are no available slots or an error occurred
//       const dummyMessage = document.createElement("p");
//       dummyMessage.textContent = "No available slots or an error occurred.";
//       slotsContainer.appendChild(dummyMessage);
//     }
//   };

//   // Function to create a card for a slot
//   const createSlotCard = (slotData) => {
//     const card = document.createElement("div");
//     card.className = "col-3";

//     const slotId = slotData.slot_id;

//     card.innerHTML = `
//       <div class="custom-card text-center" style="border-right: 1px solid rgba(0, 0, 0, 0.1);">
//         <h6 class="">SLOT ID</h6>
//         <h5>
//           <span class="badge" style="background-color: #6695ff">${slotId}</span>
//         </h5>
//       </div>
//     `;

//     return card;
//   };

//   // Function to create the "+" button
//   const createAddButton = () => {
//     const addButton = document.createElement("div");
//     addButton.className = "col-3";
//     addButton.innerHTML = `
//       <div class="custom-card text-center" style="border-right: 1px solid rgba(0, 0, 0, 0.1);">
//         <h1 style="cursor: pointer;">+</h1>
//       </div>
//     `;
//     addButton.addEventListener("click", addMoreSlots);

//     return addButton;
//   };

//   // Function to handle API errors
//   const handleAPIError = (error) => {
//     console.error("Error fetching or processing data from the API:", error);

//     const errorMessage = document.createElement("p");
//     errorMessage.textContent =
//       "Error fetching data from the API. Please try again later.";
//     slotsContainer.appendChild(errorMessage);
//   };

//   // Function to add more slots
//   const addMoreSlots = () => {
//     fetch(addSlotsEndpoint, { method: "POST" })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(() => {
//         // After successfully adding slots, fetch and update the UI again
//         fetchData();
//       })
//       .catch((error) => {
//         handleAPIError(error);
//       });
//   };

//   // Initial fetch to load the UI
//   fetchData();
// });

document.addEventListener("DOMContentLoaded", function () {
  const apiEndpoint = "http://localhost:5000/api/v1/buildings";
  const slotsEndpoint = `http://localhost:5000/api/v1/buildings/slotsDetails`;
  const addSlotsEndpoint = `${apiEndpoint}/1/addslots`;

  // Get the container outside the fetchData function
  const slotsContainer = document.getElementById("availiableSlots");

  // Function to fetch data from the API
  const fetchData = () => {
    fetch(slotsEndpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        updateUI(data);
      })
      .catch((error) => {
        handleAPIError(error);
      });
  };

  // Function to update the UI with available slots data
  const updateUI = (data) => {
    // Clear the container before updating
    slotsContainer.innerHTML = "";

    if (data.status === "success" && data.data.availableSessions.length > 0) {
      const totalSlots = parseInt(data.data.total_slot_number);
      const buildingCapacity = data.data.building_capacity;
      const availableSlots = data.data.availableSessions.length;
      const notAvailableSlots = totalSlots - availableSlots;
      const slotsPerRow = 4;

      const slotsHeader = document.createElement("h2");
      slotsHeader.textContent = `Total Available Slots: ${availableSlots} | Not Available Slots: ${notAvailableSlots} | Building Capacity: ${buildingCapacity}`;
      slotsContainer.appendChild(slotsHeader);

      for (let i = 0; i < totalSlots; i += slotsPerRow) {
        const row = document.createElement("div");
        row.className = "row mb-3";

        for (let j = 0; j < slotsPerRow && i + j < totalSlots; j++) {
          const slotData = data.data.availableSessions[i + j];
          if (slotData) {
            const card = createSlotCard(slotData);
            row.appendChild(card);
          }
        }

        slotsContainer.appendChild(row);
      }

      // If there are more slots and available slots are less than or equal to building capacity, add the "+" button after the last slot
      if (availableSlots <= buildingCapacity && availableSlots < totalSlots) {
        const lastRow = slotsContainer.lastChild;
        const addButton = createAddButton();
        lastRow.appendChild(addButton);
      }
    } else {
      // Display a dummy message if there are no available slots or an error occurred
      const dummyMessage = document.createElement("p");
      dummyMessage.textContent = "No available slots or an error occurred.";
      slotsContainer.appendChild(dummyMessage);
    }
  };

  // Function to create a card for a slot
  const createSlotCard = (slotData) => {
    const card = document.createElement("div");
    card.className = "col-3";

    const slotId = slotData.slot_id;

    card.innerHTML = `
      <div class="custom-card text-center" style="border-right: 1px solid rgba(0, 0, 0, 0.1);">
        <h6 class="">SLOT ID</h6>
        <h5>
          <span class="badge" style="background-color: #6695ff">${slotId}</span>
        </h5>
      </div>
    `;

    return card;
  };

  // Function to create the "+" button
  const createAddButton = () => {
    const addButton = document.createElement("div");
    addButton.className = "col-3";
    addButton.innerHTML = `
      <div class="custom-card text-center" style="border-right: 1px solid rgba(0, 0, 0, 0.1);">
        <h1 style="cursor: pointer;">+</h1>
      </div>
    `;
    addButton.addEventListener("click", addMoreSlots);

    return addButton;
  };
  const createMaxLimitButton = () => {
    const maxLimitButton = document.createElement("div");
    maxLimitButton.className = "col-3";
    maxLimitButton.innerHTML = `
      <div class="custom-card text-center" style="border-right: 1px solid rgba(0, 0, 0, 0.1); background-color: #ff9999;">
        <h5>Maximum number of slot limit reached</h5>
      </div>
    `;

    return maxLimitButton;
  };
  // Function to handle API errors
  const handleAPIError = (error) => {
    console.error("Error fetching or processing data from the API:", error);

    // Display an error message
    const errorMessage = document.createElement("p");
    errorMessage.textContent =
      "Error fetching data from the API. Please try again later.";
    slotsContainer.appendChild(errorMessage);
  };

  // Function to add more slots
  const addMoreSlots = () => {
    fetch(addSlotsEndpoint, { method: "POST" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        // After successfully adding slots, fetch and update the UI again
        fetchData();
      })
      .catch((error) => {
        handleAPIError(error);
      });
  };

  // Initial fetch to load the UI
  fetchData();
});
