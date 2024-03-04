// edit_file.js

async function editStaffInformation() {
    // Fetch staff information for editing only if staffId exists and on the edit page
    const urlParams = new URLSearchParams(window.location.search);
    const staffId = urlParams.get('id');

    if (staffId && window.location.pathname.includes('edit_staff.html')) {
        fetch(`http://localhost:5001/staff/${staffId}`)
            .then(response => response.json())
            .then(data => {
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

                    // Select the correct building in the dropdown
                    const buildingSelect = document.getElementById('buildingSelect');
                    const selectedBuilding = staff.buildings[0].building_name; // Access building name from the first element of the buildings array
                    const buildingOptions = buildingSelect.options;

                    // Log all option values for debugging
                    for (let i = 0; i < buildingOptions.length; i++) {
                        console.log(buildingOptions[i].value);
                    }

                    console.log('Selected Building:', selectedBuilding);

                    // Iterate through options to select the correct one
                    for (let i = 0; i < buildingOptions.length; i++) {
                        if (buildingOptions[i].value === selectedBuilding) {
                            buildingOptions[i].selected = true;
                            break;
                        }
                    }

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
                                throw new Error('Failed to update staff member.');
                            }

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
            })
            .catch(error => console.error('Error fetching staff information:', error));
    }
}

export { editStaffInformation };
