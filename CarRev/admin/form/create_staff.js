document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch building data
        const response = await fetch('http://localhost:5001/building');
        const data = await response.json();

        // Populate the building dropdown
        const selectBuilding = document.getElementById('buildingSelect'); // Use getElementById to target the specific select element
        data.forEach(building => {
            const option = document.createElement('option');
            option.textContent = building.building_name;
            option.value = building.building_name;
            selectBuilding.appendChild(option);
        });

        // Add event listener for form submission
        const form = document.getElementById('staffForm');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            try {
                const response = await fetch('http://localhost:5001/staff', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formDataObject)
                });

                if (!response.ok) {
                    throw new Error('Failed to add staff member.');
                }

                const responseData = await response.json();
                console.log(responseData.message); // Log success message

                // Redirect or display a success message as needed
                window.location.href = 'staff.html'; // Redirect to staff page after successful creation
            } catch (error) {
                console.error('Error adding staff:', error.message);
                // Display error message to the user
            }


        });
    } catch (error) {
        console.error('Error fetching building data:', error);
    }
});
