document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("formAuthentication");

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailOrUsername = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:5000/api/v1/staff/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: emailOrUsername,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, redirect to index.html or perform other actions
        window.location.href = "/CarRev/staff/index.html";
      } else {
        // Display error message
        alert(data.message);
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      // Handle error, e.g., show a generic error message
      alert("An error occurred during login. Please try again.");
    }
  });
});
