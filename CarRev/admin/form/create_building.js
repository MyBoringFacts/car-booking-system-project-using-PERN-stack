const form = document.getElementById("buildingForm");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const formDataObject = {};
  formData.forEach((value, key) => {
    formDataObject[key] = value;
  });

  try {
    // Check staff_password length
    const staffPassword = formDataObject["staff_password"];
    if (staffPassword.length > 16) {
      alert(
        "Staff password should be up to 16 characters. Please reduce the length."
      );
      return;
    }

    const buildingData = {
      building_name: formDataObject["building_name"],
      building_address: formDataObject["building_address"],
      building_capacity: formDataObject["building_capacity"],
      price_per_min: formDataObject["price_per_min"],
    };

    // Perform a POST request to create a new building
    const buildingResponse = await fetch("http://localhost:5001/building", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildingData),
    });

    if (!buildingResponse.ok) {
      throw new Error("Failed to create new building.");
    }

    const buildingResponseBody = await buildingResponse.json();
    console.log(buildingResponseBody.message);

    // If building creation is successful, proceed to create the new staff member
    const staffData = {
      staff_first_name: formDataObject["staff_first_name"],
      staff_last_name: formDataObject["staff_last_name"],
      staff_email: formDataObject["staff_email"],
      staff_password: staffPassword,
      staff_ph_no: formDataObject["staff_ph_no"],
      staff_address: formDataObject["staff_address"],
      building_name: formDataObject["building_name"], // Use the same building name for staff creation
    };

    // Perform a POST request to create a new staff member
    const staffResponse = await fetch("http://localhost:5001/staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(staffData),
    });

    if (!staffResponse.ok) {
      throw new Error("Failed to create new staff member.");
    }

    const staffResponseBody = await staffResponse.json();
    console.log(staffResponseBody.message);

    window.location.href = "building.html"; // Redirect to building page after successful creation
  } catch (error) {
    console.error(
      "Error creating new building or staff member:",
      error.message
    );
  }
});
