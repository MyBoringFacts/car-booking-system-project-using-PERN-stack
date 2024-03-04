$(document).ready(function () {
  // Replace the API URL with your actual API endpoint
  const apiUrl = "http://localhost:5000/api/v1/sessions/history";

  // Function to fetch and update reservation history
  function updateHistory() {
    $.ajax({
      url: apiUrl,
      type: "GET",
      success: function (response) {
        if (response.status === "success") {
          const historyData = response.data.bookings;
          updateHistoryTable(historyData);
        } else {
          console.error("Error fetching data:", response);
        }
      },
      error: function (error) {
        console.error("Error fetching data:", error);
      },
    });
  }

  // Function to update the history table with new data
  function updateHistoryTable(data) {
    const tableBody = $("#history-view");
    tableBody.empty(); // Clear existing data

    data.forEach(function (session) {
      const row = `
          <tr>
            <td>${session.session_id}</td>
            <td>${session.owner_name}</td>
            <td>${session.car_info}</td>
            <td>${session.arrival_time}</td>
            <td>${session.end_time}</td>
            <td>${session.charge}</td>
            <td>${session.slot_id}</td>
            <td>
              <button class="btn btn-sm btn-danger rounded delete-btn" data-session-id="${session.session_id}" style="background-color: #6695FF; border-color: #6695FF;">Delete</button>
              &nbsp;
            </td>
          </tr>
        `;

      const rowElement = $(row);
      tableBody.append(rowElement);

      // Attach click event to the "Delete" button for each row
      rowElement.find(".delete-btn").click(function () {
        const sessionId = $(this).data("session-id");
        pressDelete(sessionId, rowElement);
      });
    });
  }

  function pressDelete(sessionId, rowElement) {
    const apiUrl = `http://localhost:5000/api/v1/sessions/${sessionId}`;
    $.ajax({
      url: apiUrl,
      type: "DELETE",
      success: function (response) {
        console.log("Delete request successful:", response);
        rowElement.remove(); // Remove the deleted session row from the table
      },
      error: function (error) {
        console.error("Error sending delete request:", error);
        // Optionally, you can handle errors or take additional actions upon failure
      },
    });
  }

  // Call the updateHistory function on page load
  updateHistory();
});
