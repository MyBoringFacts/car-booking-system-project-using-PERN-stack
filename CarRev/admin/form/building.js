// // script.js
// async function deleteBuilding(id, cardDiv) {
//     try {
//         const response = await fetch(`http://localhost:5001/building/${id}`, {
//             method: 'DELETE'
//         });
//         const data = await response.json();
//         if (response.ok) {
//             console.log(data); // Log success message
//             // Remove the cardDiv from the building container
//             cardDiv.remove();
//         } else {
//             // Display error message
//             alert(data.error);
//         }
//     } catch (error) {
//         console.error('Error deleting building:', error);
//     }
// }

// fetch('http://localhost:5001/building')
//     .then(response => response.json())
//     .then(data => {
//         const tableBody = document.getElementById('building');
//         data.forEach(building => { // Iterate over buildings array
//             const row = document.createElement('div');
//             row.classList.add('col-3', 'mb-3');
//             row.innerHTML = `
//                 <div class="custom-card text-center" style="border-right: 1px solid rgba(0,0,0,0.1);">
//                     <h5 class="">${building.building_name}</h5>
//                     <p>Capacity <span class="badge" style="background-color: #6695FF;">${building.building_capacity}</span></p>
//                     <div class="button-group">
//                         <button class="btn btn-sm btn-primary rounded edit-btn" data-building-id="${building.building_id}" style="background-color: #6695FF;border-color: #6695FF;">Edit</button>
//                         <button class="btn btn-sm btn-danger rounded delete-btn" data-building-id="${building.building_id}">Delete</button>
//                     </div>
//                 </div>
//             `;
//             tableBody.appendChild(row);
//         });

//         const deleteButtons = document.querySelectorAll('.delete-btn');
//         deleteButtons.forEach(button => {
//             button.addEventListener('click', () => {
//                 const buildingId = button.getAttribute('data-building-id');
//                 const cardDiv = button.closest('.col-3'); // Get the closest .col-3 element
//                 deleteBuilding(buildingId, cardDiv);
//             });
//         });

//         const editButtons = document.querySelectorAll('.edit-btn');
//         editButtons.forEach(button => {
//             button.addEventListener('click', () => {
//                 const buildingId = button.getAttribute('data-building-id');
//                 // Redirect to edit_building.html with the building ID as a query parameter
//                 window.location.href = `edit_building.html?id=${buildingId}`;

//             });
//         });
//     })
//     .catch(error => console.error('Error fetching building data:', error));

// const form = document.getElementById('buildingForm');
// form.addEventListener('submit', async (event) => {
//     event.preventDefault();

//     const formData = new FormData(form);
//     const formDataObject = {};
//     formData.forEach((value, key) => {
//         formDataObject[key] = value;
//     });

//     try {
//         const response = await fetch('http://localhost:5001/building', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(formDataObject)
//         });

//         if (!response.ok) {
//             throw new Error('Failed to add building.');
//         }

//         const responseData = await response.json();
//         console.log(responseData.message); // Log success message

//         // Redirect or display a success message as needed
//         window.location.href = 'building.html'; // Redirect to building page after successful creation
//     } catch (error) {
//         console.error('Error adding building:', error.message);
//         // Display error message to the user
//     }
// });

// Fetch building data and render it
fetch("http://localhost:5001/building")
  .then((response) => response.json())
  .then((data) => {
    const tableBody = document.getElementById("building");
    data.forEach((building) => {
      const row = document.createElement("div");
      row.classList.add("col-3", "mb-3");
      row.innerHTML = `
                <div class="custom-card text-center" style="border-right: 1px solid rgba(0,0,0,0.1);">
                    <h5 class="">${building.building_name}</h5>
                    <p>Maximum Capacity <span class="badge" style="background-color: #6695FF;">${building.building_capacity}</span></p>
                    <div class="button-group">
                        <button class="btn btn-sm btn-primary rounded edit-btn" data-building-id="${building.building_id}" style="background-color: #6695FF;border-color: #6695FF;">Edit</button>
                        <button class="btn btn-sm btn-danger rounded delete-btn" data-building-id="${building.building_id}">Delete</button>
                    </div>
                </div>
            `;
      tableBody.appendChild(row);
    });

    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const buildingId = button.getAttribute("data-building-id");
        const cardDiv = button.closest(".col-3");
        deleteBuilding(buildingId, cardDiv);
      });
    });

    // Add event listeners for edit buttons
    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const buildingId = button.getAttribute("data-building-id");
        window.location.href = `edit_building.html?id=${buildingId}`;
      });
    });
  })
  .catch((error) => console.error("Error fetching building data:", error));

// // Function to delete a building
// async function deleteBuilding(id, cardDiv) {
//     try {
//         const response = await fetch(`http://localhost:5001/building/${id}`, {
//             method: 'DELETE'
//         });
//         const data = await response.json();
//         if (response.ok) {
//             console.log(data);
//             cardDiv.remove();
//         } else {
//             alert(data.error);
//         }
//     } catch (error) {
//         console.error('Error deleting building:', error);
//     }
// }

// Function to delete a building and its associated staff
async function deleteBuilding(id, cardDiv) {
  try {
    // Show confirmation dialog
    const confirmed = confirm(
      "Are you sure you want to delete this building? This action will delete all associated staff members as well."
    );

    if (!confirmed) {
      return; // If not confirmed, do nothing
    }

    const response = await fetch(`http://localhost:5001/staff/building/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // If staff and building are deleted successfully
      cardDiv.remove(); // Remove the building card from UI
      alert("Building and associated staff deleted successfully.");
    } else {
      const data = await response.json();
      alert(data.error); // Show error message
    }
  } catch (error) {
    console.error("Error deleting building:", error);
  }
}

const urlParams = new URLSearchParams(window.location.search);
const buildingId = urlParams.get("id");

// Fetch building information for editing only if buildingId exists and on the edit page
if (buildingId && window.location.pathname.includes("edit_building.html")) {
  fetch(`http://localhost:5001/building/${buildingId}`)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const building = data[0];
        console.log(building);
        console.log(document.getElementById("buildingName"));
        console.log(building.building_name);
        document.getElementById("buildingName").value = building.building_name;
        document.getElementById("buildingAddress").value =
          building.building_address;
        document.getElementById("buildingCapacity").value =
          building.building_capacity;
        document.getElementById("buildingPrice").value = building.price_per_min;
      } else {
        console.error("Building not found or invalid response");
      }
    })
    .catch((error) =>
      console.error("Error fetching building information:", error)
    );
}

// Form submission logic for adding/editing building
// const form = document.getElementById('buildingForm');
// form.addEventListener('submit', async (event) => {
//     event.preventDefault();

//     const formData = new FormData(form);
//     const formDataObject = {};
//     formData.forEach((value, key) => {
//         formDataObject[key] = value;
//     });

//     try {
//         const url = buildingId ? `http://localhost:5001/building/${buildingId}` : 'http://localhost:5001/building';
//         const method = buildingId ? 'PUT' : 'POST';

//         const response = await fetch(url, {
//             method: method,
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(formDataObject)
//         });

//         if (!response.ok) {
//             throw new Error('Failed to add/update building.');
//         }

//         const responseData = await response.json();
//         console.log(responseData.message);

//         window.location.href = 'building.html';
//     } catch (error) {
//         console.error('Error adding/updating building:', error.message);
//     }
// });

// Form submission logic for adding/editing building
const form = document.getElementById("buildingForm");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const formDataObject = {};
  formData.forEach((value, key) => {
    formDataObject[key] = value;
  });

  try {
    const buildingId = urlParams.get("id"); // Get the building ID from the form data

    if (!buildingId) {
      throw new Error("Building ID is required for updating a building.");
    }

    const url = `http://localhost:5001/building/${buildingId}`;
    const method = "PUT";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formDataObject),
    });

    if (!response.ok) {
      throw new Error("Failed to update building.");
    }

    const responseData = await response.json();
    console.log(responseData.message);

    window.location.href = "building.html";
  } catch (error) {
    console.error("Error updating building:", error.message);
  }
});
