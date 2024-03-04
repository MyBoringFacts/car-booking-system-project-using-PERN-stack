$(document).ready(function () {
  // Replace the API URL with your actual API endpoint
  const apiUrl =
    "http://localhost:5001/api/buildings/:buildingId/unverified-sessions";

  // Function to fetch and update reservation data
  function updateReservations() {
    $.ajax({
      url: apiUrl,
      type: "GET",
      success: function (response) {
        if (response.status === "success") {
          const unverifiedSessions = response.data.unverifiedSessions;
          updateReservationTable(unverifiedSessions);
        } else {
          console.error("Error fetching data:", response);
        }
      },
      error: function (error) {
        console.error("Error fetching data:", error);
      },
    });
  }

  // Function to update the reservation table with new data
  function updateReservationTable(data) {
    const tableBody = $("#adminReservationTableBody");
    tableBody.empty(); // Clear existing data

    const unverifiedSessions = data.filter((session) => !session.accepted);

    unverifiedSessions.forEach(function (session) {
      const row = `
          <tr>
            <td>${session.customer_id}</td>
            <td>${session.owner_name}</td>
           
            <td>${session.car_info}</td>
            <td>${session.book_time}</td>
            <td>${session.building_name}</td>
            <td>${session.slot_id}</td>
            <td>
              <button class="btn btn-sm btn-primary rounded accept-btn" data-session-id="${session.session_id}" style="background-color: #6695FF; border-color: #6695FF;">Confirm</button>
              &nbsp;
              <button class="btn btn-sm btn-danger rounded reject-btn" data-session-id="${session.session_id}">Reject</button>
            </td>
          </tr>
        `;

      const rowElement = $(row);
      tableBody.append(rowElement);

      // Attach click event to the "Accept" and "Reject" buttons for each row
      rowElement.find(".accept-btn").click(function () {
        const sessionId = $(this).data("session-id");
        pressAccept(sessionId, rowElement);
      });

      rowElement.find(".reject-btn").click(function () {
        // Handle reject logic if needed
      });
    });
  }

  function pressAccept(sessionId, rowElement) {
    const apiUrl = `http://localhost:5000/api/v1/sessions/${sessionId}/pressAccept`;

    $.ajax({
      url: apiUrl,
      type: "PUT",
      success: function (response) {
        console.log("Accept request successful:", response);
        rowElement.remove(); // Remove the accepted session row from the table
      },
      error: function (error) {
        console.error("Error sending accept request:", error);
        // Optionally, you can handle errors or take additional actions upon failure
      },
    });
  }

  // Call the updateReservations function on page load
  updateReservations();
});
