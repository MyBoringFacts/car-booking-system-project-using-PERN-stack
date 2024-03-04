document.addEventListener('DOMContentLoaded', async () => {
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent the default behavior of anchor tag
    
            const staffId = button.getAttribute('data-staff-id');
            console.log('Edit button clicked for staff ID:', staffId);
    
            try {
                // Fetch staff data by ID
                const response = await fetch(`http://localhost:5001/staff/${staffId}`);
                const staffData = await response.json();
                console.log('Staff Data:', staffData);
    
                // Populate the form fields with staff data
                document.getElementById('staffId').value = staffData.staff_id; // Add a hidden input for staff id
                document.getElementById('staffFirstName').value = staffData.staff_first_name;
                document.getElementById('staffLastName').value = staffData.staff_last_name;
                document.getElementById('staffEmail').value = staffData.staff_email;
                document.getElementById('staffPassword').value = staffData.staff_password;
                document.getElementById('staffPhone').value = staffData.staff_phone_number;
                document.getElementById('staffAddress').value = staffData.staff_address;
    
                // Select the correct building in the dropdown
                const buildingSelect = document.getElementById('buildingSelect');
                const selectedBuilding = staffData.building_name;
                const buildingOptions = buildingSelect.options;
                for (let i = 0; i < buildingOptions.length; i++) {
                    if (buildingOptions[i].text === selectedBuilding) {
                        buildingOptions[i].selected = true;
                        break;
                    }
                }
            } catch (error) {
                console.error('Error fetching staff data:', error);
            }
        });
    });
});
