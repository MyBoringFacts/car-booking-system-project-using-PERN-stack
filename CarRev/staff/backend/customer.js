// $(document).ready(function () {
//   const apiUrl = "http://localhost:5000/api/v1/buildings/1/customers";
//   const tableBody = $("#customer-view");

//   function updateCustomers() {
//     $.ajax({
//       url: apiUrl,
//       type: "GET",
//       success: function (response) {
//         console.log(response);
//         if (
//           response.status === "success" &&
//           response.data &&
//           response.data.customers
//         ) {
//           const customersData = response.data.customers;
//           updateCustomersTable(customersData);
//         } else {
//           handleApiError("Invalid API response format");
//         }
//       },
//       error: function (xhr, textStatus, errorThrown) {
//         handleApiError("Error fetching data from the API: " + textStatus);
//       },
//     });
//   }

//   function updateCustomersTable(data) {
//     tableBody.empty(); // Clear existing data

//     data.forEach(function (customer) {
//       const row = `
//           <tr>
//             <td>${customer.customer_id}</td>
//             <td>${customer.owner_name} </td>
//             <td>${customer.customer_ph_no}</td>
//             <td>${customer.customer_email}</td>
//             <td>${customer.car_id}
//             <td>${customer.car_info}</td>

//           </tr>
//         `;

//       tableBody.append(row);
//     });
//   }

//   function handleApiError(message) {
//     console.error(message);
//     // You can add user-friendly error handling here if needed
//   }

//   // Call the updateCustomers function on page load
//   updateCustomers();
// });$(document).ready(function () {
$(document).ready(function () {
  const apiUrl = "http://localhost:5000/api/v1/buildings/1/customers";
  const tableBody = $("#customer-view");

  function updateCustomers() {
    $.ajax({
      url: apiUrl,
      type: "GET",
      success: function (response) {
        console.log(response);
        if (
          response.status === "success" &&
          response.data &&
          response.data.customers
        ) {
          const customersData = response.data.customers;
          const uniqueCustomers = mergeDuplicateCustomers(customersData);
          updateCustomersTable(uniqueCustomers);
        } else {
          handleApiError("Invalid API response format");
        }
      },
      error: function (xhr, textStatus, errorThrown) {
        handleApiError("Error fetching data from the API: " + textStatus);
      },
    });
  }

  function mergeDuplicateCustomers(data) {
    const uniqueCustomers = {};

    data.forEach(function (customer) {
      const customerId = customer.customer_id;

      if (!uniqueCustomers[customerId]) {
        uniqueCustomers[customerId] = {
          ...customer,
          carInfo: `${customer.car_id}: ${customer.car_info}`,
        };
      } else {
        uniqueCustomers[
          customerId
        ].carInfo += `<br>${customer.car_id}: ${customer.car_info}`;
      }
    });

    return Object.values(uniqueCustomers);
  }

  function updateCustomersTable(data) {
    tableBody.empty(); // Clear existing data

    data.forEach(function (customer) {
      const row = `
          <tr>
            <td>${customer.customer_id}</td>
            <td>${customer.owner_name} </td>
            <td>${customer.customer_ph_no}</td>
            <td>${customer.customer_email}</td>
            <td>${customer.carInfo}</td>
            <td>${customer.customer_address}</td>
          </tr>
        `;

      tableBody.append(row);
    });
  }

  function handleApiError(message) {
    console.error(message);
    // You can add user-friendly error handling here if needed
  }

  // Call the updateCustomers function on page load
  updateCustomers();
});
