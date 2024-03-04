// Fetch customer data from the server
fetch("http://localhost:5001/customer")
  .then((response) => response.json())
  .then((data) => {
    const tableBody = document.getElementById("table-body");
    let customers = data; // Store the original customer data

    // Function to render customer data based on search query
    function renderCustomers(query = "") {
      // Clear the table body before rendering
      tableBody.innerHTML = "";

      // Filter customers based on the search query
      const filteredCustomers = customers.filter((customer) => {
        // Convert search query and customer names to lowercase for case-insensitive search
        const searchTerm = query.toLowerCase();
        const fullName =
          `${customer.customer_first_name} ${customer.customer_last_name}`.toLowerCase();
        return fullName.includes(searchTerm);
      });

      // Render filtered customers
      filteredCustomers.forEach((customer) => {
        let carDetails = "";
        customer.cars.forEach((car, index) => {
          carDetails += `${car.car_license} ${car.car_brand} ${car.car_model} (${car.car_color})`;
          if (index < customer.cars.length - 1) {
            carDetails += ",<br>";
          }
        });
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${customer.customer_id}</td>
                    <td>${customer.customer_first_name} ${customer.customer_last_name}</td>
                    <td>${customer.customer_ph_no}</td>
                    <td>${customer.customer_email}</td>
                    <td>${carDetails}</td>
                `;
        tableBody.appendChild(row);
      });
    }

    // Initial rendering of all customers
    renderCustomers();

    // Add event listener to search input field
    const searchInput = document.querySelector(".form-control");
    searchInput.addEventListener("input", function () {
      renderCustomers(this.value); // Render customers based on search query
    });
  })
  .catch((error) => console.error("Error fetching customer data:", error));
