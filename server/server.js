require("dotenv").config();
const express = require("express");
const app = express();

const db = require("./db/index.js");
app.use(express.json());

const port_number = process.env.PORT || 5001;
app.listen(port_number, () => {
  console.log(`Server is up on ${port_number}`);
});

//GET ALL CUSTOMER;
app.get("/api/v1/customer", async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM customer;`);

    res.status(200).json({
      status: "success",
      data: results.rows.map((customer) => ({
        customer_id: customer.customer_id,
        customer_first_name: customer.customer_first_name,
        customer_last_name: customer.customer_last_name,
        customer_ph_no: customer.customer_ph_no,
        customer_email: customer.customer_email,
        customer_password: customer.customer_password,
      })),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

//GET ONE CUSTOMER;
app.get("/api/v1/customer/:id", async (req, res) => {
  try {
    const results = await db.query(
      `SELECT * FROM customer WHERE customer_id =  $1;`,
      [req.params.id]
    );

    res.status(200).json({
      status: "success",
      data: results.rows.map((customer) => ({
        customer_id: customer.customer_id,
        customer_first_name: customer.customer_first_name,
        customer_last_name: customer.customer_last_name,
        customer_ph_no: customer.customer_ph_no,
        customer_address: customer.customer_address,
        customer_email: customer.customer_email,
        customer_password: customer.customer_password,
      })),
    });
    console.log("GET OPERATION SUCCESS");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

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

app.use(express.json()); // Middleware to parse JSON requests

// Create operation for a new building
app.post("/api/v1/buildings", async (req, res) => {
  try {
    const { building_address, building_capacity, building_name } = req.body;

    const results = await db.query(
      `INSERT INTO building
       (building_address, building_capacity, building_name)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [building_address, building_capacity, building_name]
    );

    res.status(201).json({
      status: "success",
      data: {
        building: results.rows[0],
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

// Read operation for all buildings
app.get("/api/v1/buildings", async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM building;`);

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

// Read operation for a specific building
app.get("/api/v1/buildings/:buildingId", async (req, res) => {
  const buildingId = req.params.buildingId;

  try {
    const results = await db.query(
      `SELECT * FROM building
       WHERE building_id = $1;`,
      [buildingId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Building not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: {
          building: results.rows[0],
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

// Update operation for a specific building
app.put("/api/v1/buildings/:buildingId", async (req, res) => {
  const buildingId = req.params.buildingId;

  try {
    const { building_address, building_capacity, building_name } = req.body;

    const results = await db.query(
      `UPDATE building
       SET building_address = $1,
           building_capacity = $2,
           building_name = $3
       WHERE building_id = $4
       RETURNING *;`,
      [building_address, building_capacity, building_name, buildingId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Building not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Building updated successfully",
        data: {
          building: results.rows[0],
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

// Delete operation for a specific building
app.delete("/api/v1/buildings/:buildingId", async (req, res) => {
  const buildingId = req.params.buildingId;

  try {
    const results = await db.query(
      `DELETE FROM building
       WHERE building_id = $1
       RETURNING *;`,
      [buildingId]
    );

    if (results.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Building not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Building deleted successfully",
        data: {
          building: results.rows[0],
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

// Delete operation for a specific slot in a specific building
app.delete("/api/v1/buildings/:buildingId/slots/:slotId", async (req, res) => {
  const buildingId = req.params.buildingId;
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
