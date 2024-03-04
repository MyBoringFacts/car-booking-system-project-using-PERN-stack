// filename: me.js

// Call the updateProfile function in your fetchStaffDetails function
const fetchStaffDetails = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/v1/staff/info/me");
    const data = await response.json();

    if (data.status === "success") {
      updateNavbar(data.data.staff);
      updateProfile(data.data.staff); // Add this line to update the new elements
    } else {
      // Handle error case
      console.error("Error fetching staff details:", data.message);
    }
  } catch (error) {
    console.error("Error fetching staff details:", error.message);
  }
};

// Function to update the navbar with staff details
const updateNavbar = (staffDetails) => {
  // Update the building label
  const buildingId = document.getElementById("buildingId");
  buildingId.textContent = staffDetails.building_id;

  // Update the user profile information
  const staffName = document.getElementById("staffName");
  staffName.textContent = `${staffDetails.staff_first_name} ${staffDetails.staff_last_name}`;

  // You can similarly update other parts of the navbar based on staffDetails
};

// Wait for the DOM content to be loaded before executing the code
document.addEventListener("DOMContentLoaded", () => {
  // Call the fetchStaffDetails function when the page is loaded
  fetchStaffDetails();
});

const updateProfile = (staffDetails) => {
  const pfpstaffName = document.getElementById("pfpstaffName");
  pfpstaffName.textContent = `${staffDetails.staff_first_name} ${staffDetails.staff_last_name}`;

  const pfpbuildingId = document.getElementById("pfpbuildingId");
  pfpbuildingId.textContent = staffDetails.building_id;
};
