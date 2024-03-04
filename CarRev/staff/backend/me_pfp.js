// filename: me.js

// Function to fetch staff details from the server
const showMyPfp = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/v1/staff/info/me");
    const data = await response.json();

    if (data.status === "success") {
      updateFormFields(data.data.staff);
    } else {
      // Handle error case
      console.error("Error fetching staff details:", data.message);
    }
  } catch (error) {
    console.error("Error fetching staff details:", error.message);
  }
};

// Function to update the form fields with staff details
const updateFormFields = (staffDetails) => {
  document.getElementById(
    "staff_name"
  ).value = `${staffDetails.staff_first_name} ${staffDetails.staff_last_name}`;
  document.getElementById("email").value = staffDetails.staff_email;
  document.getElementById("address").value = staffDetails.staff_address; // Note: This might not be secure in a real application
  document.getElementById("phone").value = staffDetails.staff_ph_no;
};

// Wait for the DOM content to be loaded before executing the code
document.addEventListener("DOMContentLoaded", () => {
  // Call the fetchStaffDetails function when the page is loaded
  showMyPfp();
});
