require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const db = require("./db/index.js");
const sessionManager = require("./sessionManager.js");
app.use(express.json());
app.use(cors());
const port_number = process.env.PORT || 5001;
app.listen(port_number, () => {
  console.log(`Server is up on ${port_number}`);
});

// //GET ALL CUSTOMER;
// app.get("/api/v1/customer", async (req, res) => {
//   try {
//     const results = await db.query(`SELECT * FROM customer;`);

//     res.status(200).json({
//       status: "success",
//       data: results.rows.map((customer) => ({
//         customer_id: customer.customer_id,
//         customer_first_name: customer.customer_first_name,
//         customer_last_name: customer.customer_last_name,
//         customer_ph_no: customer.customer_ph_no,
//         customer_email: customer.customer_email,
//         customer_password: customer.customer_password,
//       })),
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

// //GET ONE CUSTOMER;
// app.get("/api/v1/customer/:id", async (req, res) => {
//   try {
//     const results = await db.query(
//       `SELECT * FROM customer WHERE customer_id =  $1;`,
//       [req.params.id]
//     );

//     res.status(200).json({
//       status: "success",
//       data: results.rows.map((customer) => ({
//         customer_id: customer.customer_id,
//         customer_first_name: customer.customer_first_name,
//         customer_last_name: customer.customer_last_name,
//         customer_ph_no: customer.customer_ph_no,
//         customer_address: customer.customer_address,
//         customer_email: customer.customer_email,
//         customer_password: customer.customer_password,
//       })),
//     });
//     console.log("GET OPERATION SUCCESS");
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

//Update a customer
app.put("/api/v1/customer/:id", async (req, res) => {
  const customerId = req.params.id;

  try {
    const {
      customer_first_name,
      customer_last_name,
      customer_ph_no,
      customer_address,
      customer_email,
      customer_password,
    } = req.body;

    const results = await db.query(
      `UPDATE customer
         SET customer_first_name = $1,
             customer_last_name = $2,
             customer_ph_no = $3,
             customer_address = $4,
             customer_email = $5,
             customer_password = $6
         WHERE customer_id = $7
         RETURNING *;`,
      [
        customer_first_name,
        customer_last_name,
        customer_ph_no,
        customer_address,
        customer_email,
        customer_password,
        customerId,
      ]
    );

    res.status(200).json({
      status: "success",
      data: {
        customer: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
    console.log("UPDATE OPERATION FAILED");
  }
});

//Create
app.post("/api/v1/customer", async (req, res) => {
  try {
    const {
      customer_first_name,
      customer_last_name,
      customer_ph_no,
      customer_address,
      customer_email,
      customer_password,
    } = req.body;

    const results = await db.query(
      `INSERT INTO customer
         (customer_first_name, customer_last_name, customer_ph_no, customer_address, customer_email, customer_password)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *;`,
      [
        customer_first_name,
        customer_last_name,
        customer_ph_no,
        customer_address,
        customer_email,
        customer_password,
      ]
    );

    res.status(201).json({
      status: "success",
      data: {
        customer: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
    console.log("CREATE OPERATION FAILED");
  }
});

//Delete

app.delete("/api/v1/customer/:id", async (req, res) => {
  const customerId = req.params.id;

  try {
    const results = await db.query(
      `DELETE FROM customer
         WHERE customer_id = $1
         RETURNING *;`,
      [customerId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Customer deleted successfully",
        data: {
          customer: results.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
    console.log("DELETE OPERATION FAILED");
  }
});
// Exmaple express.json
// {
//     "status": "success",
//     "data": [
//       {
//         "restaurant_id": 1,
//         "name": "Restaurant 1",
//         "location": "Location 1"
//       },
//       {
//         "restaurant_id": 2,
//         "name": "Restaurant 2",
//         "location": "Location 2"
//       }
//     ]
//   }

//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************

// Create operation for a new car for a specific customer
app.post("/api/v1/customer/:customerId/cars", async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const { car_brand, car_model, car_color, car_license } = req.body;

    const results = await db.query(
      `INSERT INTO car
         (car_brand, car_model, car_color, car_license, customer_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;`,
      [car_brand, car_model, car_color, car_license, customerId]
    );

    res.status(201).json({
      status: "success",
      data: {
        car: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Read operation for all cars of a specific customer
app.get("/api/v1/customer/:customerId/cars", async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const results = await db.query(
      `SELECT * FROM car
         WHERE customer_id = $1;`,
      [customerId]
    );

    res.status(200).json({
      status: "success",
      data: results.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Read operation for all cars
app.get("/api/v1/cars", async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM car;`);

    res.status(200).json({
      status: "success",
      data: results.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Read operation for a specific car
app.get("/api/v1/cars/:carId", async (req, res) => {
  const carId = req.params.carId;

  try {
    const results = await db.query(
      `SELECT * FROM car
         WHERE car_id = $1;`,
      [carId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Car not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: {
          car: results.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Update operation for a specific car of a specific customer
app.put("/api/v1/customer/:customerId/cars/:carId", async (req, res) => {
  const customerId = req.params.customerId;
  const carId = req.params.carId;

  try {
    const { car_brand, car_model, car_color, car_license } = req.body;

    const results = await db.query(
      `UPDATE car
         SET car_brand = $1,
             car_model = $2,
             car_color = $3,
             car_license = $4
         WHERE car_id = $5
         AND customer_id = $6
         RETURNING *;`,
      [car_brand, car_model, car_color, car_license, carId, customerId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Car not found for the given customer",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Car updated successfully",
        data: {
          car: results.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Delete operation for a specific car of a specific customer
app.delete("/api/v1/customer/:customerId/cars/:carId", async (req, res) => {
  const customerId = req.params.customerId;
  const carId = req.params.carId;

  try {
    const results = await db.query(
      `DELETE FROM car
         WHERE car_id = $1
         AND customer_id = $2
         RETURNING *;`,
      [carId, customerId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Car not found for the given customer",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Car deleted successfully",
        data: {
          car: results.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************

// //Create a staff
// app.post("/api/v1/staff", async (req, res) => {
//   const {
//     staff_first_name,
//     staff_last_name,
//     staff_ph_no,
//     staff_address,
//     staff_email,
//     staff_password,
//     building_id,
//   } = req.body;

//   try {
//     const results = await db.query(
//       "INSERT INTO Staff(staff_first_name, staff_last_name, staff_ph_no, staff_address, staff_email, staff_password, building_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
//       [
//         staff_first_name,
//         staff_last_name,
//         staff_ph_no,
//         staff_address,
//         staff_email,
//         staff_password,
//         building_id,
//       ]
//     );

//     res.status(201).json({
//       status: "success",
//       data: {
//         staff: results.rows[0],
//       },
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//     console.log("POST OPERATION FAILED");
//   }
// });

// //get a staff within a building
// app.get("/api/v1/staff/building/:building_id", async (req, res) => {
//   const buildingId = req.params.building_id;

//   try {
//     const results = await db.query(
//       "SELECT * FROM Staff WHERE building_id = $1",
//       [buildingId]
//     );
//     res.status(200).json({
//       status: "success",
//       data: {
//         staff: results.rows,
//       },
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//     console.log("GET OPERATION FAILED");
//   }
// });

// //get a staff by id
// app.get("/api/v1/staff/:id", async (req, res) => {
//   const staffId = req.params.id;

//   try {
//     const results = await db.query("SELECT * FROM Staff WHERE staff_id = $1", [
//       staffId,
//     ]);
//     res.status(200).json({
//       status: "success",
//       data: {
//         staff: results.rows[0],
//       },
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//     console.log("GET OPERATION FAILED");
//   }
// });
// //get all the staffs
// app.get("/api/v1/staff", async (req, res) => {
//   try {
//     const results = await db.query("SELECT * FROM Staff");
//     res.status(200).json({
//       status: "success",
//       data: {
//         staff: results.rows,
//       },
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//     console.log("GET OPERATION FAILED");
//   }
// });
// //delete a staff
// app.delete("/api/v1/staff/:id", async (req, res) => {
//   const staffId = req.params.id;

//   try {
//     await db.query("DELETE FROM Staff WHERE staff_id = $1", [staffId]);
//     res.status(200).json({
//       status: "success",
//       message: "Staff member deleted successfully",
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//     console.log("DELETE OPERATION FAILED");
//   }
// });

// // Update a staff
app.put("/api/v1/staff/:id", async (req, res) => {
  const staffId = req.params.id;

  try {
    const {
      staff_first_name,
      staff_last_name,
      staff_ph_no,
      staff_address,
      staff_email,
      staff_password,
      building_id,
    } = req.body;

    const results = await db.query(
      `UPDATE Staff
         SET staff_first_name = $1,
             staff_last_name = $2,
             staff_ph_no = $3,
             staff_address = $4,
             staff_email = $5,
             staff_password = $6,
             building_id = $7
         WHERE staff_id = $8
         RETURNING *;`,
      [
        staff_first_name,
        staff_last_name,
        staff_ph_no,
        staff_address,
        staff_email,
        staff_password,
        building_id,
        staffId,
      ]
    );

    res.status(200).json({
      status: "success",
      data: {
        staff: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
    console.log("UPDATE OPERATION FAILED");
  }
});
//get a staff by id
app.get("/api/v1/staff/:id", async (req, res) => {
  const staffId = req.params.id;

  try {
    const results = await db.query("SELECT * FROM Staff WHERE staff_id = $1", [
      staffId,
    ]);
    res.status(200).json({
      status: "success",
      data: {
        staff: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
    console.log("GET OPERATION FAILED");
  }
});
//update a staff
app.put("/api/v1/staff/:id", async (req, res) => {
  const staffId = req.params.id;

  try {
    const {
      staff_first_name,
      staff_last_name,
      staff_ph_no,
      staff_address,
      staff_email,
      staff_password,
      building_id,
    } = req.body;

    const results = await db.query(
      `UPDATE Staff
         SET staff_first_name = $1,
             staff_last_name = $2,
             staff_ph_no = $3,
             staff_address = $4,
             staff_email = $5,
             staff_password = $6,
             building_id = $7
         WHERE staff_id = $8
         RETURNING *;`,
      [
        staff_first_name,
        staff_last_name,
        staff_ph_no,
        staff_address,
        staff_email,
        staff_password,
        building_id,
        staffId,
      ]
    );

    res.status(200).json({
      status: "success",
      data: {
        staff: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
    console.log("UPDATE OPERATION FAILED");
  }
});

// app.post("/api/v1/staff/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Retrieve staff information based on the provided staff_id
//     const results = await db.query("SELECT * FROM Staff WHERE staff_id = $1", [
//       username,
//     ]);

//     // Check if a staff member with the provided staff_id exists
//     if (results.rows.length === 0) {
//       return res.status(401).json({
//         status: "error",
//         message: "Invalid username or password",
//       });
//     }

//     // Retrieve additional details, e.g., building information
//     const staffDetails = results.rows[0];
//     const buildingInfo = await db.query(
//       "SELECT * FROM Building WHERE building_id = $1",
//       [staffDetails.building_id]
//     );

//     // Set the current building information using the module
//     buildingInfoModule.setCurrentBuilding(
//       buildingInfo.rows[0].buildingName,
//       staffDetails
//     );
//     console.log("Results from staff query:", results.rows);
//     console.log("Staff details:", staffDetails);
//     console.log("Building information:", buildingInfo.rows[0]);

//     // Login successful, send the response
//     res.status(200).json({
//       status: "success",
//       message: "Login successful",
//       data: {
//         staff: {
//           staff_id: staffDetails.staff_id,
//           staff_first_name: staffDetails.staff_first_name,
//           staff_last_name: staffDetails.staff_last_name,
//           staff_ph_no: staffDetails.staff_ph_no,
//           staff_address: staffDetails.staff_address,
//           staff_email: staffDetails.staff_email,
//           building: buildingInfo.rows[0], // Include building details
//         },
//       },
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

app.post("/api/v1/staff/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Retrieve staff information based on the provided staff_id
    const results = await db.query("SELECT * FROM Staff WHERE staff_id = $1", [
      username,
    ]);

    // Check if a staff member with the provided staff_id and password exists
    if (
      results.rows.length === 0 ||
      results.rows[0].staff_password !== password
    ) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    // Staff details
    const staffDetails = results.rows[0];

    // Set session data
    sessionManager.setSession({
      staff_id: staffDetails.staff_id,
      staff_first_name: staffDetails.staff_first_name,
      staff_last_name: staffDetails.staff_last_name,
      staff_ph_no: staffDetails.staff_ph_no,
      staff_address: staffDetails.staff_address,
      staff_email: staffDetails.staff_email,
      building_id: staffDetails.building_id,
    });
    // Login successful, send the response
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        staff: {
          staff_id: staffDetails.staff_id,
          staff_first_name: staffDetails.staff_first_name,
          staff_last_name: staffDetails.staff_last_name,
          staff_ph_no: staffDetails.staff_ph_no,
          staff_address: staffDetails.staff_address,
          staff_email: staffDetails.staff_email,
          building_id: staffDetails.building_id,
        },
      },
    });
    console.log(sessionManager.getSession());
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// example login post
// {
//   "username": "john_doe",
//   "password": "password123"
// }
// Assuming you have an express app instance named 'app'

// GET endpoint to retrieve details of the currently signed-in staff
app.get("/api/v1/staff/info/me", (req, res) => {
  try {
    // Retrieve staff details from the session
    const staffDetails = sessionManager.getSession();

    // Check if staff is signed in
    if (!staffDetails || !staffDetails.staff_id) {
      return res.status(401).json({
        status: "error",
        message: "Not signed in",
      });
    }

    // Send staff details in the response
    res.status(200).json({
      status: "success",
      data: {
        staff: {
          staff_id: staffDetails.staff_id,
          staff_first_name: staffDetails.staff_first_name,
          staff_last_name: staffDetails.staff_last_name,
          staff_ph_no: staffDetails.staff_ph_no,
          staff_address: staffDetails.staff_address,
          staff_email: staffDetails.staff_email,
          building_id: staffDetails.building_id,
        },
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// // **********************************************************************************

// // Create operation for a new building
// app.post("/api/v1/buildings", async (req, res) => {
//   try {
//     const { building_address, building_capacity, building_name } = req.body;

//     const results = await db.query(
//       `INSERT INTO building
//        (building_address, building_capacity, building_name)
//        VALUES ($1, $2, $3)
//        RETURNING *;`,
//       [building_address, building_capacity, building_name]
//     );

//     res.status(201).json({
//       status: "success",
//       data: {
//         building: results.rows[0],
//       },
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

// // Read operation for all buildings
// app.get("/api/v1/buildings", async (req, res) => {
//   try {
//     const results = await db.query(`SELECT * FROM building;`);

//     res.status(200).json({
//       status: "success",
//       data: results.rows,
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

// // Read operation for a specific building
// app.get("/api/v1/buildings/:buildingId", async (req, res) => {
//   const buildingId = req.params.buildingId;

//   try {
//     const results = await db.query(
//       `SELECT * FROM building
//        WHERE building_id = $1;`,
//       [buildingId]
//     );

//     if (results.rows.length === 0) {
//       res.status(404).json({
//         status: "error",
//         message: "Building not found",
//       });
//     } else {
//       res.status(200).json({
//         status: "success",
//         data: {
//           building: results.rows[0],
//         },
//       });
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

// // Update operation for a specific building
// app.put("/api/v1/buildings/:buildingId", async (req, res) => {
//   const buildingId = req.params.buildingId;

//   try {
//     const { building_address, building_capacity, building_name } = req.body;

//     const results = await db.query(
//       `UPDATE building
//        SET building_address = $1,
//            building_capacity = $2,
//            building_name = $3
//        WHERE building_id = $4
//        RETURNING *;`,
//       [building_address, building_capacity, building_name, buildingId]
//     );

//     if (results.rows.length === 0) {
//       res.status(404).json({
//         status: "error",
//         message: "Building not found",
//       });
//     } else {
//       res.status(200).json({
//         status: "success",
//         message: "Building updated successfully",
//         data: {
//           building: results.rows[0],
//         },
//       });
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

// // Delete operation for a specific building
// app.delete("/api/v1/buildings/:buildingId", async (req, res) => {
//   const buildingId = req.params.buildingId;

//   try {
//     const results = await db.query(
//       `DELETE FROM building
//        WHERE building_id = $1
//        RETURNING *;`,
//       [buildingId]
//     );

//     if (results.rows.length === 0) {
//       res.status(404).json({
//         status: "error",
//         message: "Building not found",
//       });
//     } else {
//       res.status(200).json({
//         status: "success",
//         message: "Building deleted successfully",
//         data: {
//           building: results.rows[0],
//         },
//       });
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************

// Assuming you have a database connection setup and assigned to the variable 'db'
// Replace this with your actual database connection code

// Create operation for a new slot in a building

// POST endpoint to create slots for a specific building
app.post("/api/v1/buildings/:buildingId/slots", async (req, res) => {
  try {
    const buildingId = req.params.buildingId;
    const { slotId } = req.body;

    // Validate request data (you can add more validation as needed)
    if (!slotId) {
      return res.status(400).json({ error: "Slot ID is required." });
    }

    // Check if the building exists
    const buildingExists = await db.query(
      "SELECT * FROM Building WHERE building_id = $1",
      [buildingId]
    );

    if (!buildingExists.rows.length) {
      return res.status(404).json({ error: "Building not found." });
    }

    // Insert the slot into the Slot table
    const result = await db.query(
      "INSERT INTO Slot (building_id, slot_id,slot_status) VALUES ($1, $2,$3) RETURNING *",
      [buildingId, slotId, true]
    );

    const newSlot = result.rows[0];

    res
      .status(201)
      .json({ message: "Slot created successfully", slot: newSlot });
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//
//
//
////

// Read operation for all slots in a specific building
app.get("/api/v1/buildings/:buildingId/slots", async (req, res) => {
  const buildingId = req.params.buildingId;

  try {
    const results = await db.query(
      `SELECT * FROM slot
       WHERE building_id = $1;`,
      [buildingId]
    );

    res.status(200).json({
      status: "success",
      data: results.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Read operation for a specific slot in a specific building
app.get("/api/v1/buildings/:buildingId/slots/:slotId", async (req, res) => {
  const buildingId = req.params.buildingId;
  const slotId = req.params.slotId;

  try {
    const results = await db.query(
      `SELECT * FROM slot
       WHERE building_id = $1 AND slot_id = $2;`,
      [buildingId, slotId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Slot not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: {
          slot: results.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Update operation for a specific slot in a specific building
app.put("/api/v1/buildings/:buildingId/slots/:slotId", async (req, res) => {
  const buildingId = req.params.buildingId;
  const slotId = req.params.slotId;

  try {
    const { slot_status } = req.body;

    const results = await db.query(
      `UPDATE slot
       SET slot_status = $1
       WHERE building_id = $2 AND slot_id = $3
       RETURNING *;`,
      [slot_status, buildingId, slotId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Slot not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Slot updated successfully",
        data: {
          slot: results.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// **********************************************************************************
//***********************************************************************************
// *******************************************
// *******************************************
// *******************************************
// *******************************************
// *******************************************

// *******************************************
// *******************************************
// *******************************************

// *******************************************
// *******************************************
// *******************************************
// *******************************************
// *******************************************
// *******************************************
// *******************************************
// *******************************************
// *******************************************

//for sessions
app.post("/api/v1/sessions", async (req, res) => {
  const {
    car_id,
    slot_id,
    arrival_time,
    end_time,
    building_id,
    book_time,
    staff_auth,
  } = req.body;

  // If book_time is not provided, use the current system time
  const currentBookTime = book_time || new Date();

  // If staff_auth is not provided, default to "unverified"
  const staffAuth = staff_auth || "unverified";

  try {
    const result = await db.query(
      `INSERT INTO session (car_id,slot_id, arrival_time, building_id, book_time, staff_auth)
       VALUES ($1, $2, $3, $4, $5, $6,$7)
       RETURNING *;`,
      [
        car_id,
        slot_id,
        arrival_time,
        end_time,
        building_id,
        currentBookTime,
        staffAuth,
      ]
    );

    res.status(201).json({
      status: "success",
      data: {
        booking: result.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.get("/api/v1/buildings/:buildingId/sessions", async (req, res) => {
  const buildingId = req.params.buildingId;

  try {
    const results = await db.query(
      `SELECT * FROM session
       WHERE building_id = $1;`,
      [buildingId]
    );

    res.status(200).json({
      status: "success",
      data: {
        bookings: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.get("/api/v1/sessions/history", async (req, res) => {
  const session_id = req.params.sessionId;
  const temp = sessionManager.getSession();

  const buildingId = temp?.building_id ?? 1;

  try {
    const results = await db.query(
      `SELECT 
      *,  
      CONCAT(customer.customer_first_name, ' ', customer.customer_last_name) AS owner_name, 
      CONCAT(car.car_license, ' ', COALESCE(car.car_model, ''), ' ', COALESCE(car.car_color, '')) AS car_info,
      TO_CHAR(session.arrival_time, 'YYYY-MM-DD HH24:MI') AS arrival_time,
      TO_CHAR(session.end_time, 'YYYY-MM-DD HH24:MI') AS end_time,
      TO_CHAR(session.book_time, 'YYYY-MM-DD HH24:MI') AS book_time
  FROM 
      session
  JOIN 
      car ON session.car_id = car.car_id
  JOIN 
      customer ON car.customer_id = customer.customer_id
  WHERE 
      session.building_id = $1
      AND end_time IS NOT NULL
      AND charge != 0
  ORDER BY 
      session.end_time DESC;
  
       `,
      [buildingId]
    );

    res.status(200).json({
      status: "success",
      data: {
        bookings: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.put("/api/v1/sessions/:sesssionId", async (req, res) => {
  const bookingId = req.params.sesssionId;
  const { arrival_time, end_time } = req.body;

  try {
    const result = await db.query(
      `UPDATE session
       SET arrival_time = $1, end_time = $2
       WHERE session_id = $3
       RETURNING *;`,
      [arrival_time, end_time, bookingId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: {
          booking: result.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.put("/api/v1/sessions/:sesssionId/pressAccept", async (req, res) => {
  const sessionId = req.params.sesssionId;
  try {
    const result = await db.query(
      `UPDATE session
       SET staff_auth = 'accepted'
       WHERE session_id = $1
       RETURNING *;`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Booking not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: {
          booking: result.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// app.delete("/api/v1/sessions/:sessionId", async (req, res) => {
//   const bookingId = req.params.sessionId;

//   try {
//     const result = await db.query(
//       `DELETE FROM session
//        WHERE session_id = $1
//        RETURNING *;`,
//       [bookingId]
//     );

//     if (result.rows.length === 0) {
//       res.status(404).json({
//         status: "error",
//         message: "Booking not found",
//       });
//     } else {
//       res.status(200).json({
//         status: "success",
//         data: {
//           message: "Booking canceled successfully",
//         },
//       });
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });
// // Delete operation for a specific slot in a specific building
// app.delete("/api/v1/buildings/slots/:slotId", async (req, res) => {
//   const temp = sessionManager.getSession();
//   const buildingId = temp?.building_id;

//   const slotId = req.params.slotId;

//   try {
//     const deleteSlotResults = await db.query(
//       `DELETE FROM slot
//        WHERE building_id = $1 AND slot_id = $2
//        RETURNING *;`,
//       [buildingId, slotId]
//     );

//     if (deleteSlotResults.rows.length === 0) {
//       res.status(404).json({
//         status: "error",
//         message: "Slot not found",
//       });
//       return;
//     }

//     // Delete associated sessions
//     const deleteSessionsResults = await db.query(
//       `DELETE FROM session_table
//        WHERE building_id = $1 AND slot_id = $2;`,
//       [buildingId, slotId]
//     );

//     res.status(200).json({
//       status: "success",
//       message: "Slot and associated sessions deleted successfully",
//       data: {
//         slot: deleteSlotResults.rows[0],
//         deletedSessionsCount: deleteSessionsResults.rowCount,
//       },
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

app.delete("/api/v1/buildings/slots/:slotId", async (req, res) => {
  const temp = sessionManager.getSession();
  const buildingId = temp?.building_id;

  const slotId = req.params.slotId;

  try {
    // Check if there are associated sessions
    const checkSessionResults = await db.query(
      `SELECT * FROM session
       WHERE building_id = $1 AND slot_id = $2;`,
      [buildingId, slotId]
    );

    if (checkSessionResults.rows.length > 0) {
      res.status(200).json({
        status: "error",
        message: "Slot has associated sessions. Cannot delete.",
      });
      return;
    }

    // Delete the slot record
    const deleteSlotResults = await db.query(
      `DELETE FROM slot
       WHERE building_id = $1 AND slot_id = $2
       RETURNING *;`,
      [buildingId, slotId]
    );

    if (deleteSlotResults.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Slot not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Slot deleted successfully",
      data: {
        slot: deleteSlotResults.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});
app.delete("/api/v1/buildings/slots/:slotId/sessions", async (req, res) => {
  const temp = sessionManager.getSession();
  const buildingId = temp?.building_id;

  const slotId = req.params.slotId;

  try {
    // Delete associated sessions
    const deleteSessionsResults = await db.query(
      `DELETE FROM session
       WHERE building_id = $1 AND slot_id = $2;`,
      [buildingId, slotId]
    );

    // Delete the slot record
    const deleteSlotResults = await db.query(
      `DELETE FROM slot
       WHERE building_id = $1 AND slot_id = $2
       RETURNING *;`,
      [buildingId, slotId]
    );

    if (deleteSlotResults.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Slot not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Slot and associated sessions deleted successfully",
      data: {
        deletedSessionsCount: deleteSessionsResults.rowCount,
        slot: deleteSlotResults.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

app.get(
  "/api/v1/buildings/:buildingId/unverified-sessions",
  async (req, res) => {
    const temp = sessionManager.getSession();
    // if (temp) {
    //   const staffId = temp.staff_first_name;
    //   console.log(staffId);
    // } else {
    //   console.log("thjere is no session");
    // }
    // Get buildingId from the sessionManager

    const buildingId = temp?.building_id ?? 1;

    try {
      if (!buildingId) {
        return res.status(400).json({
          status: "error",
          message: "Building ID not found in the session",
        });
      }

      // const results = await db.query(
      //   `SELECT session.*, CONCAT(customer.customer_first_name, ' ', customer.customer_last_name) AS owner_name
      //     FROM session
      //     JOIN car ON session.car_id = car.car_id
      //     JOIN customer ON car.customer_id = customer.customer_id
      //     WHERE session.building_id = $1
      //     AND session.staff_auth = 'unverified';`,
      //   [buildingId]
      // );
      const results = await db.query(
        `SELECT session.*, CONCAT(customer.customer_first_name, ' ', customer.customer_last_name) AS owner_name, 
                                  CONCAT(car.car_license, ' ', COALESCE(car.car_model, ''), ' ', COALESCE(car.car_color, '')) AS car_info,
                                  TO_CHAR(session.arrival_time, 'YYYY-MM-DD HH24:MI') AS arrival_time,
                                  TO_CHAR(session.end_time, 'YYYY-MM-DD HH24:MI') AS end_time,
                                  TO_CHAR(session.book_time, 'YYYY-MM-DD HH24:MI') AS book_time
                                  
                                  
       
          FROM session
          JOIN car ON session.car_id = car.car_id
          JOIN customer ON car.customer_id = customer.customer_id
          WHERE session.building_id = $1
          AND session.staff_auth = 'unverified'
          ORDER BY session.book_time ASC;;`,
        [buildingId]
      );

      res.status(200).json({
        status: "success",
        data: {
          unverifiedSessions: results.rows,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
);

app.get("/api/v1/buildings/:buildingId/accepted-sessions", async (req, res) => {
  const temp = sessionManager.getSession();
  // if (temp) {
  //   const staffId = temp.staff_first_name;
  //   console.log(staffId);
  // } else {
  //   console.log("thjere is no session");
  // }
  // Get buildingId from the sessionManager
  const buildingId = temp?.building_id ?? 1;

  try {
    if (!buildingId) {
      return res.status(400).json({
        status: "error",
        message: "Building ID not found in the session",
      });
    }
    const results = await db.query(
      `SELECT session.*, CONCAT(customer.customer_first_name, ' ', customer.customer_last_name) AS owner_name, 
                                  CONCAT(car.car_license, ' ', COALESCE(car.car_model, ''), ' ', COALESCE(car.car_color, '')) AS car_info,
                                  TO_CHAR(session.arrival_time, 'YYYY-MM-DD HH24:MI') AS arrival_time,
                                  TO_CHAR(session.start_time, 'YYYY-MM-DD HH24:MI') AS start_time,
                                  TO_CHAR(session.end_time, 'YYYY-MM-DD HH24:MI') AS end_time,
                                  TO_CHAR(session.book_time, 'YYYY-MM-DD HH24:MI') AS book_time,
                                  customer.customer_ph_no as customer_ph_no,
                                  customer.customer_id as customer_id
                                  
       
          FROM session
          JOIN car ON session.car_id = car.car_id
          JOIN customer ON car.customer_id = customer.customer_id
          WHERE session.building_id = $1
          AND session.staff_auth = 'accepted'
          AND arrival_time IS null
          ORDER BY session.book_time ASC;`,
      [buildingId]
    );

    res.status(200).json({
      status: "success",
      data: {
        acceptedSessions: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.get("/api/v1/buildings/:buildingId/occupied-sessions", async (req, res) => {
  const temp = sessionManager.getSession();
  // if (temp) {
  //   const staffId = temp.staff_first_name;
  //   console.log(staffId);
  // } else {
  //   console.log("thjere is no session");
  // }
  // Get buildingId from the sessionManager
  const buildingId = temp?.building_id ?? 1;

  try {
    if (!buildingId) {
      return res.status(400).json({
        status: "error",
        message: "Building ID not found in the session",
      });
    }
    const results = await db.query(
      `SELECT session.*, CONCAT(customer.customer_first_name, ' ', customer.customer_last_name) AS owner_name, 
                                  CONCAT(car.car_license, ' ', COALESCE(car.car_model, ''), ' ', COALESCE(car.car_color, '')) AS car_info,
                                  TO_CHAR(session.arrival_time, 'YYYY-MM-DD HH24:MI') AS arrival_time,
                                  TO_CHAR(session.start_time, 'YYYY-MM-DD HH24:MI') AS start_time,
                                  TO_CHAR(session.end_time, 'YYYY-MM-DD HH24:MI') AS end_time,
                                  TO_CHAR(session.book_time, 'YYYY-MM-DD HH24:MI') AS book_time,
                                  customer.customer_ph_no as customer_ph_no,
                                  customer.customer_id as customer_id
                                  
       
          FROM session
          JOIN car ON session.car_id = car.car_id
          JOIN customer ON car.customer_id = customer.customer_id
          WHERE session.building_id = $1
          AND session.staff_auth = 'accepted'
          AND arrival_time IS NOT null
          AND end_time IS null
          ORDER BY session.book_time ASC;`,
      [buildingId]
    );

    res.status(200).json({
      status: "success",
      data: {
        acceptedSessions: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// app.put("/api/v1/sessions/:sesssionId/terminate", async (req, res) => {
//   const bookingId = req.params.sesssionId;
//   const { end_time } = req.body;

//   try {
//     const result = await db.query(
//       `UPDATE session
//        SET  end_time = $1
//        WHERE session_id = $2
//        RETURNING *;`,
//       [end_time, bookingId]
//     );

//     if (result.rows.length === 0) {
//       res.status(404).json({
//         status: "error",
//         message: "Booking not found",
//       });
//     } else {
//       res.status(200).json({
//         status: "success",
//         data: {
//           booking: result.rows[0],
//         },
//       });
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });
app.put("/api/v1/sessions/:sessionId/terminate", async (req, res) => {
  const sessionId = req.params.sessionId;
  const { end_time } = req.body;

  try {
    // Update the session's end_time
    const updateResult = await db.query(
      `UPDATE session
       SET end_time = $1
       WHERE session_id = $2
       RETURNING *;`,
      [end_time, sessionId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Session not found",
      });
    }

    const session = updateResult.rows[0];

    // Calculate and update the charge based on arrival_time, end_time, and building's price_per_min
    const chargeResult = await db.query(
      `UPDATE session
       SET charge = (
         EXTRACT(EPOCH FROM (session.end_time - session.arrival_time)) / 60 * building.price_per_min
       )
       FROM building
       WHERE session.session_id = $1
         AND session.building_id = building.building_id
         AND session.arrival_time IS NOT NULL
         AND session.end_time IS NOT NULL
       RETURNING session.*, building.price_per_min;`,
      [sessionId]
    );

    if (chargeResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Session or building not found",
      });
    }

    const updatedSession = chargeResult.rows[0];

    return res.status(200).json({
      status: "success",
      data: {
        session: updatedSession,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.get("/api/v1/buildings/:buildingId/customers", async (req, res) => {
  const temp = sessionManager.getSession();
  // if (temp) {
  //   const staffId = temp.staff_first_name;
  //   console.log(staffId);
  // } else {
  //   console.log("thjere is no session");
  // }
  // Get buildingId from the sessionManager
  const reqBuildingId = req.params.buildingId;
  const buildingId = temp?.building_id ?? reqBuildingId;

  try {
    if (!buildingId) {
      return res.status(400).json({
        status: "error",
        message: "Building ID not found in the session",
      });
    }
    const results = await db.query(
      `SELECT DISTINCT customer.*, car.car_id,        
      CONCAT(customer.customer_first_name, ' ', customer.customer_last_name) AS owner_name, 
      CONCAT(car.car_license, ' ', COALESCE(car.car_model, ''), ' ', COALESCE(car.car_color, '')) AS car_info
                                  
       
          FROM customer
          JOIN car ON customer.customer_id = car.customer_id
          LEFT JOIN session ON car.car_id = session.car_id
          WHERE session.building_id = $1 OR session.building_id IS NULL
          ORDER BY customer.customer_id ASC, car.car_id ASC;`,
      [buildingId]
    );

    res.status(200).json({
      status: "success",
      data: {
        customers: results.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// app.get("/api/v1/buildings/slotDetails", async (req, res) => {
//   console.log("Inside the route callback");
//   try {
//     const temp = sessionManager.getSession();
//     console.log("Session:", temp);

//     const buildingId = temp?.building_id ?? 1;
//     console.log("Building ID:", buildingId);

//     const results = await db.query(
//       `SELECT
//         COUNT(*) AS total_slots,
//         SUM(CASE WHEN slot_status = TRUE THEN 1 ELSE 0 END) AS total_available_slots,
//         SUM(CASE WHEN slot_status = FALSE THEN 1 ELSE 0 END) AS total_occupied_slots
//       FROM Slot
//       WHERE building_id = $1`,
//       [parseInt(buildingId)]
//     );

//     const { total_slots, total_available_slots, total_occupied_slots } =
//       results.rows[0];

//     res.status(200).json({
//       status: "success",
//       data: {
//         totalSlots: total_slots,
//         totalAvailableSlots: total_available_slots,
//         totalOccupiedSlots: total_occupied_slots,
//       },
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// });

// POST endpoint to create slots for a specific building
app.post("/api/v1/buildings/:building/addslots", async (req, res) => {
  const temp = sessionManager.getSession();
  try {
    const buildingId = temp?.building_id ?? req.params.building;
    const { slotId } = req.body;

    // Retrieve all existing slot_ids for the given building
    const existingSlotsResult = await db.query(
      "SELECT slot_id FROM Slot WHERE building_id = $1 ORDER BY slot_id ASC",
      [buildingId]
    );

    const existingSlots = existingSlotsResult.rows.map((row) => row.slot_id);

    let nextSlotId;

    if (slotId && !existingSlots.includes(slotId)) {
      // Use the provided slot_id if it doesn't already exist
      nextSlotId = slotId;
    } else {
      // Determine the next available slot_id by finding the first gap
      for (let i = 1; i <= existingSlots.length; i++) {
        if (!existingSlots.includes(i)) {
          nextSlotId = i;
          break;
        }
      }

      // If no gap is found, use the next number after the last existing slot_id
      if (!nextSlotId) {
        nextSlotId = existingSlots.length + 1;
      }
    }

    // Insert the slot into the Slot table
    const result = await db.query(
      "INSERT INTO Slot (building_id, slot_id) VALUES ($1, $2) RETURNING *",
      [buildingId, nextSlotId]
    );

    const newSlot = result.rows[0];

    res
      .status(201)
      .json({ message: "Slot created successfully", slot: newSlot });
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/v1/buildings/slotsDetails", async (req, res) => {
  const temp = sessionManager.getSession();

  const buildingId = temp?.building_id ?? 1;

  try {
    // Get building_capacity from building table
    const buildingCapacityResult = await db.query(
      `SELECT building_capacity FROM building WHERE building_id = $1;`,
      [buildingId]
    );

    const buildingCapacity = buildingCapacityResult.rows[0]?.building_capacity;

    // Count the total_slot_number for the specified building_id
    const totalSlotResult = await db.query(
      `SELECT COUNT(*) as total_slot_number FROM slot
       WHERE building_id = $1;`,
      [buildingId]
    );

    const totalSlotNumber = totalSlotResult.rows[0]?.total_slot_number;

    // Get available slots information
    const availableResults = await db.query(
      `SELECT * FROM slot
       WHERE building_id = $1 AND slot_status = TRUE ORDER BY slot_id;`,
      [buildingId]
    );

    const availableSessions = availableResults.rows.map((slot) => ({
      building_id: slot.building_id,
      slot_id: slot.slot_id,
      slot_status: slot.slot_status,
    }));

    // Get occupied slots information
    const occupiedResults = await db.query(
      `SELECT * FROM slot
       WHERE building_id = $1 AND slot_status = FALSE;`,
      [buildingId]
    );

    const occupiedSessions = occupiedResults.rows.map((slot) => ({
      building_id: slot.building_id,
      slot_id: slot.slot_id,
      slot_status: slot.slot_status,
    }));

    res.status(200).json({
      status: "success",
      data: {
        total_slot_number: totalSlotNumber,
        building_capacity: buildingCapacity,
        availableSessions: availableSessions,
        occupiedSessions: occupiedSessions,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Delete operation for a specific slot in a specific building
app.delete("/api/v1/buildings/slots/:slotId", async (req, res) => {
  const temp = sessionManager.getSession();
  const buildingId = temp?.building_id;

  const slotId = req.params.slotId;

  try {
    const results = await db.query(
      `DELETE FROM slot
       WHERE building_id = $1 AND slot_id = $2
       RETURNING *;`,
      [buildingId, slotId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Slot not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Slot deleted successfully",
        data: {
          slot: results.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.put("/api/v1/sessions/pressReject/:sessionId", async (req, res) => {
  // const slotId = req.params.slotId;
  // const buildingId = req.params.buildingId;
  // const carId = req.params.carId;
  const session_id = req.params.sessionId;

  try {
    const result = await db.query(
      `UPDATE session
       SET 
         arrival_time = NOW(),
         end_time = NOW(),
         charge = 0
       WHERE 
        
         session_id = $1
       RETURNING *;`,
      [session_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Slot not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: {
          slot: result.rows[0],
        },
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});
