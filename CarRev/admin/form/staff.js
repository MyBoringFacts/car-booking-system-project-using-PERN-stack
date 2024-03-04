async function fetchStaff() {
    try {
        const response = await fetch('http://localhost:5001/staff');
        if (!response.ok) {
            throw new Error('Failed to fetch staff data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching staff:', error);
        throw error;
    }
}

async function deleteStaff(id) {
    try {
        console.log('Attempting to delete staff with ID:', id);
        const response = await fetch(`http://localhost:5001/staff/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const responseData = await response.json();
            if (response.status === 404 && responseData.error === "There is only one staff in this building. Cannot delete the last staff.") {
                alert("There is only one staff in this building. Cannot delete the last staff.");
            } else {
                alert('Failed to delete staff');
            }
            await populateStaffTable();
            // You can add additional error handling here if needed
        } else {
            console.log('Staff deleted successfully');
            await populateStaffTable(); // Refresh the staff table
            return true; // Indicate successful deletion
        }
    } catch (error) {
        console.error('Error deleting staff:', error.message);
        throw error;
    }
}





// Function to populate the staff table
async function populateStaffTable() {
    try {
        const staffData = await fetchStaff();
        const tableBody = document.querySelector('.body');
        tableBody.innerHTML = ''; // Clear existing rows
        staffData.forEach(staff => {
            staff.buildings.forEach(building => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${staff.staff_id}</td>
                    <td>${staff.staff_first_name} ${staff.staff_last_name}</td>
                    <td>${staff.staff_ph_no}</td>
                    <td>${staff.staff_email}</td>
                    <td>${building.building_name}</td>
                    <td>
                        <button class="btn btn-sm btn-primary rounded edit-btn" data-staff-id="${staff.staff_id}" style="background-color: #6695FF;border-color: #6695FF;">Edit</button> &nbsp;
                        <button class="btn btn-sm btn-danger rounded delete-btn" data-staff-id="${staff.staff_id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);

            });
        });
    } catch (error) {
        console.error('Error populating staff table:', error);
    }
}


async function handleEditStaff(staffId) {
    try {
        // Redirect to edit_staff.html with staff ID as query parameter
        window.location.href = `edit_staff.html?id=${staffId}`;
        console.log(staffId);
    } catch (error) {
        console.error('Error editing staff:', error);
    }
}


async function initializePage() {
    try {
        // Populate the staff table
        await populateStaffTable();

        // Add event listener for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const staffId = button.getAttribute('data-staff-id');
                if (confirm('Are you sure you want to delete this staff member?')) {
                    try {
                        await deleteStaff(staffId);
                        await initializePage(); // Refresh the table after deletion
                    } catch (error) {
                        console.error('Error deleting staff:', error.message);
                    }
                }
            });
        });

        // Add event listener for edit buttons
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            console.log('Edit button clicked'); // Log when edit button is clicked
            button.addEventListener('click', async () => {
                console.log('Edit button clicked'); // Log when edit button is clicked
                const staffId = button.getAttribute('data-staff-id');
                console.log('Staff ID:', staffId); // Log the staff ID
                await handleEditStaff(staffId);
            });
        });

    } catch (error) {
        console.error('Error initializing page:', error);
    }
}


// Initialize the page
document.addEventListener('DOMContentLoaded', initializePage);


// Fetch staff information for editing only if staffId exists and on the edit page
async function editStaffInformation() {
    const urlParams = new URLSearchParams(window.location.search);
    const staffId = urlParams.get('id');

    if (staffId && window.location.pathname.includes('edit_staff.html')) {
        try {
            const response = await fetch(`http://localhost:5001/staff/${staffId}`);
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                const staff = data[0];
                console.log('Staff:', staff);
                staff.buildings.forEach(building => {
                    console.log('Building:', building);
                });

                document.getElementById('staffFirstName').value = staff.staff_first_name;
                document.getElementById('staffLastName').value = staff.staff_last_name;
                document.getElementById('staffEmail').value = staff.staff_email;
                document.getElementById('staffPassword').value = staff.staff_password;
                document.getElementById('staffPhone').value = staff.staff_ph_no;
                document.getElementById('staffAddress').value = staff.staff_address;

                // Fetch building data
                const buildingResponse = await fetch('http://localhost:5001/building');
                const buildingData = await buildingResponse.json();

                // Populate the building dropdown
                const selectBuilding = document.getElementById('buildingSelect'); // Use getElementById to target the specific select element
                buildingData.forEach(building => {
                    const option = document.createElement('option');
                    option.textContent = building.building_name;
                    option.value = building.building_name;
                    selectBuilding.appendChild(option);
                });

                // Select the correct building in the dropdown
                const selectedBuilding = staff.buildings[0].building_name; // Access building name from the first element of the buildings array
                selectBuilding.value = selectedBuilding;

                // Add event listener for form submission
                const form = document.getElementById('staffForm-edit');
                form.addEventListener('submit', async (event) => {
                    event.preventDefault();

                    // Prepare form data to be sent in the PUT request
                    const formData = new FormData(form);
                    const formDataObject = {};
                    formData.forEach((value, key) => {
                        formDataObject[key] = value;
                    });

                    try {
                        // Send a PUT request to update staff information
                        const response = await fetch(`http://localhost:5001/staff/${staffId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formDataObject)
                        });

                        if (!response.ok) {
                            const responseData = await response.json();
                            if (response.status === 404 && responseData.error === "There is only one staff in this building. Cannot update the last staff.") {
                                alert("There is only one staff in this building. Cannot update the last staff.");
                            } else {
                                alert('Failed to update staff');
                            }                        }

                        const responseData = await response.json();
                        console.log(responseData.message); // Log success message

                        // Redirect to staff page after successful update
                        window.location.href = 'staff.html';
                    } catch (error) {
                        console.error('Error updating staff:', error.message);
                        // Handle error scenario
                    }
                });
            } else {
                console.error('Staff not found or invalid response');
            }
        } catch (error) {
            console.error('Error fetching staff information:', error);
        }
    }
}

// Call editStaffInformation to fetch and populate staff information
editStaffInformation();
