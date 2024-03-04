document.addEventListener("DOMContentLoaded", function () {
  const apiEndpoint = "http://localhost:5000/api/v1/buildings";
  const slotsEndpoint = `${apiEndpoint}/slotsDetails`;
  const addSlotsEndpoint = `${apiEndpoint}/1/addslots`;

  const slotsContainer = document.getElementById("availiableSlots");

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
  // ...
  const updateUI = (data) => {
    slotsContainer.innerHTML = "";

    if (data.status === "success") {
      const availableSessions = data.data.availableSessions.length;
      const occupiedSessions = data.data.occupiedSessions.length;
      const totalSlots = availableSessions + occupiedSessions;
      const buildingCapacity = data.data.building_capacity;
      const slotsPerRow = 4;

      const slotsHeader = document.createElement("h2");
      slotsHeader.textContent = `Maximum Slot Limit: ${totalSlots} ,
      Total Available Slots: ${availableSessions},Occupied Slots: ${occupiedSessions}`;

      slotsContainer.appendChild(slotsHeader);

      for (let i = 0; i < availableSessions; i += slotsPerRow) {
        const row = document.createElement("div");
        row.className = "row mb-3";

        for (let j = 0; j < slotsPerRow && i + j < availableSessions; j++) {
          const card = createSlotCard(data.data.availableSessions[i + j]);
          row.appendChild(card);
        }

        slotsContainer.appendChild(row);
      }

      if (totalSlots < buildingCapacity) {
        const lastRow = slotsContainer.lastChild;
        const lastRowColumnCount = lastRow ? lastRow.childElementCount : 0;

        // Check if we need to create a new row
        if (!lastRow || lastRowColumnCount === slotsPerRow) {
          const newRow = document.createElement("div");
          newRow.className = "row mb-3";
          slotsContainer.appendChild(newRow);

          const addButton = createAddButton();
          newRow.appendChild(addButton);
        } else {
          // Append the "+" button to the last row in the next available column
          const addButton = createAddButton();
          lastRow.appendChild(addButton);
        }
      }
    } else {
      const dummyMessage = document.createElement("p");
      dummyMessage.textContent = "No available slots or an error occurred.";
      slotsContainer.appendChild(dummyMessage);
    }
  };

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
        <button class="delete-button" style="background-color: #ff6666; cursor: pointer;">-</button>
      </div>
    `;

    const deleteButton = card.querySelector(".delete-button");
    deleteButton.addEventListener("click", async () => {
      try {
        const response = await fetch(`${apiEndpoint}/slots/${slotId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const rawResponse = await response.text();
          console.log("Raw response:", rawResponse);

          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = JSON.parse(rawResponse);
            console.log(data.message);
            fetchData();
          } else {
            console.log("Slot deleted successfully");
            fetchData();
          }

          card.remove();
        } else {
          const data = await response.json();
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    });

    return card;
  };

  // const createAddButton = () => {
  //   const addButton = document.createElement("div");
  //   addButton.className = "col-3";
  //   addButton.innerHTML = `
  //     <div class="custom-card text-center" style="border-right: 1px solid rgba(0, 0, 0, 0.1);">
  //       <h1 style="cursor: pointer;">+</h1>
  //     </div>
  //   `;
  //   addButton.addEventListener("click", addMoreSlots);

  //   return addButton;
  // };
  const createAddButton = () => {
    const addButton = document.createElement("div");
    addButton.className = "col-3";
    addButton.innerHTML = `
      <div class="custom-card text-center" style="border-right: 1px solid rgba(0, 0, 0, 0.1);">
        <h1 style="cursor: pointer; line-height: 50px;">+</h1>
      </div>
    `;
    addButton.addEventListener("click", addMoreSlots);

    return addButton;
  };

  const handleAPIError = (error) => {
    console.error("Error fetching or processing data from the API:", error);

    const errorMessage = document.createElement("p");
    errorMessage.textContent =
      "Error fetching data from the API. Please try again later.";
    slotsContainer.appendChild(errorMessage);
  };

  const addMoreSlots = () => {
    fetch(addSlotsEndpoint, { method: "POST" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        fetchData();
      })
      .catch((error) => {
        handleAPIError(error);
      });
  };

  fetchData();
});

// document.addEventListener("DOMContentLoaded", function () {
//   const apiEndpoint = "http://localhost:5000/api/v1/buildings";
//   const slotsEndpoint = `${apiEndpoint}/slotsDetails`;
//   const addSlotsEndpoint = `${apiEndpoint}/1/addslots`;

//   // Declare slotsContainer at the beginning to make it accessible in the entire scope
//   const slotsContainer = document.getElementById("availiableSlots");

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
//     slotsContainer.innerHTML = "";

//     if (data.status === "success") {
//       const availableSessions = data.data.availableSessions.length;
//       const occupiedSessions = data.data.occupiedSessions.length;
//       const totalSlots = availableSessions + occupiedSessions;
//       const buildingCapacity = data.data.building_capacity;
//       const slotsPerRow = 4;

//       const slotsHeader = document.createElement("h2");
//       slotsHeader.textContent = `Total Available Slots: ${availableSessions}`;
//       slotsContainer.appendChild(slotsHeader);

//       for (let i = 0; i < availableSessions; i += slotsPerRow) {
//         const row = document.createElement("div");
//         row.className = "row mb-3";

//         for (let j = 0; j < slotsPerRow && i + j < availableSessions; j++) {
//           const card = createSlotCard(data.data.availableSessions[i + j]);
//           row.appendChild(card);
//         }

//         slotsContainer.appendChild(row);
//       }

//       // Check if the total number of slots exceeds the current building capacity
//       if (totalSlots >= buildingCapacity) {
//         const maxLimitMessage = document.createElement("p");
//         maxLimitMessage.textContent = "Maximum slot limit reached.";
//         slotsContainer.appendChild(maxLimitMessage);
//       } else {
//         // If there are more available slots, add the "+" button after the last slot
//         if (availableSessions > slotsPerRow) {
//           const lastRow = slotsContainer.lastChild;
//           const addButton = createAddButton();
//           lastRow.appendChild(addButton);
//         }
//       }
//     } else {
//       // Display a dummy message if there are no available slots or an error occurred
//       const dummyMessage = document.createElement("p");
//       dummyMessage.textContent = "No available slots or an error occurred.";
//       slotsContainer.appendChild(dummyMessage);
//     }
//   };

//   const createSlotCard = (slotData) => {
//     const card = document.createElement("div");
//     card.className = "col-3";

//     const slotId = slotData.slot_id;

//     card.innerHTML = `
//           <div class="custom-card text-center" style="border-right: 1px solid rgba(0, 0, 0, 0.1);">
//             <h6 class="">SLOT ID</h6>
//             <h5>
//               <span class="badge" style="background-color: #6695ff">${slotId}</span>
//             </h5>
//           </div>
//         `;

//     return card;
//   };

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
