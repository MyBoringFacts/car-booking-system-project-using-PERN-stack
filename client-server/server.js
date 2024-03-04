require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db.js");
app.use(express.json());
app.use(cors());
const customerSessionmanager = require("./customer_session_manager.js");
const port_number = process.env.PORT || 5001;
app.listen(port_number, () => {
  console.log(`Server is up on ${port_number}`);
});

//GET CUSTOMER;
app.get("/api/v1/customerInfo", async (req, res) => {
  try {
    const temp = customerSessionmanager.getCustomerSession();
    const customer_id = temp?.customer_id ?? 1;
    const results = await db.query(
      `SELECT * FROM customer WHERE customer_id =  $1;`,
      [customer_id]
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

// GET car
app.get("/api/v1/car", async (req, res) => {
  try {
    const temp = customerSessionmanager.getCustomerSession();
    const customer_id = temp?.customer_id ?? 1;
    const results = await db.query(
      `SELECT * FROM car WHERE customer_id =  $1;`,
      [customer_id]
    );

    res.status(200).json({
      status: "success",
      data: results.rows.map((car) => ({
        car_id: car.car_id,
        car_brand: car.car_brand,
        car_model: car.car_model,
        car_color: car.car_color,
        car_license: car.car_license,
        customer_id: car.customer_id,
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

// PUT customer
app.put("/api/v1/customer", async (req, res) => {
  try {
    const {
      customer_first_name,
      customer_last_name,
      customer_ph_no,
      customer_email,
      customer_address,
    } = req.body; // Assuming these are the fields you want to update
    const temp = customerSessionmanager.getCustomerSession();
    const customer_id = temp?.customer_id ?? 1;

    // Perform validation if needed

    const results = await db.query(
      `UPDATE customer SET 
       customer_first_name = $1,
       customer_last_name = $2,
       customer_ph_no = $3,
       customer_email = $4,
       customer_address = $5
       WHERE customer_id = $6
       RETURNING *;`,
      [
        customer_first_name,
        customer_last_name,
        customer_ph_no,
        customer_email,
        customer_address,
        customer_id,
      ]
    );

    res.status(200).json({
      status: "success",
      data: results.rows[0], // Assuming only one row will be updated
    });
    console.log("PUT OPERATION SUCCESS");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

app.put("/api/v1/car", async (req, res) => {
  try {
    const { car_model, car_brand, car_license, car_color } = req.body; // Assuming these are the fields you want to update
    const temp = customerSessionmanager.getCustomerSession();
    const customer_id = temp?.customer_id ?? 1;

    // Log request payload
    console.log("Request payload:", req.body);

    // Ensure req.body is an array
    if (!Array.isArray(req.body)) {
      throw new Error("Request body must be an array of car updates");
    }

    // Fetch all cars belonging to the customer
    const carsInCustomer = await db.query(
      "SELECT * FROM car WHERE customer_id = $1 ORDER BY customer_id ASC",
      [customer_id]
    );

    // Update each car
    const updatedCars = [];
    for (let i = 0; i < req.body.length; i++) {
      const { car_model, car_brand, car_license, car_color } = req.body[i];
      const car = carsInCustomer.rows[i];

      // Log car details before update
      console.log("Updating car:", car);

      const updatedCar = await db.query(
        `UPDATE car SET 
         car_model = $1,
         car_brand = $2,
         car_license = $3,
         car_color = $4
         WHERE car_id = $5
         RETURNING *;`,
        [car_model, car_brand, car_license, car_color, car.car_id]
      );

      // Log updated car details
      console.log("Updated car:", updatedCar.rows[0]);

      updatedCars.push(updatedCar.rows[0]);
    }

    // Log updated cars array
    console.log("Updated cars:", updatedCars);

    res.status(200).json({
      status: "success",
      data: updatedCars, // Return the array of updated cars
    });
    console.log("PUT OPERATION SUCCESS");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// POST car
app.post("/api/v1/car", async (req, res) => {
  try {
    const { car_model, car_brand, car_license, car_color } = req.body; // Assuming these are the fields you want to create a new car
    const temp = customerSessionmanager.getCustomerSession();
    const customer_id = temp?.customer_id ?? 1;

    // Perform validation if needed

    const newCar = await db.query(
      `INSERT INTO car (car_model, car_brand, car_license, car_color, customer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [car_model, car_brand, car_license, car_color, customer_id]
    );

    res.status(201).json({
      status: "success",
      data: newCar.rows[0],
    });
    console.log("POST OPERATION SUCCESS");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

//get
app.get("/api/v1/car/:carId", async (req, res) => {
  try {
    const carId = req.params.carId;
    const temp = customerSessionmanager.getCustomerSession();
    const customer_id = temp?.customer_id ?? 1;

    console.log(carId);
    console.log(customer_id);

    // Fetch details of the requested car
    const carResult = await db.query(
      `SELECT *
       FROM car
       WHERE car_id = $1 AND customer_id = $2;`,
      [carId, customer_id]
    );

    console.log(carResult.rows);
    if (carResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Car not found or does not belong to the customer",
      });
    }

    res.status(200).json({
      status: "success",
      car: carResult.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// DELETE car
app.delete("/api/v1/car/:carId", async (req, res) => {
  try {
    const carId = req.params.carId;
    const temp = customerSessionmanager.getCustomerSession();
    const customer_id = temp?.customer_id ?? 1;

    // Count the number of cars belonging to the customer
    const carCountResult = await db.query(
      `SELECT COUNT(*) AS car_count
       FROM car
       WHERE customer_id = $1;`,
      [customer_id]
    );

    const carCount = parseInt(carCountResult.rows[0].car_count);

    // Check if the car being deleted is the last car the customer has
    if (carCount <= 1) {
      return res.status(400).json({
        status: "error",
        message: "You cannot delete the last car you have",
      });
    }

    // Perform the deletion
    const result = await db.query(
      `DELETE FROM car
       WHERE car_id = $1
       RETURNING *;`,
      [carId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Car not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Car deleted successfully",
    });
    console.log("DELETE OPERATION SUCCESS");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// PUT car
app.put("/api/v1/car/:carId", async (req, res) => {
  try {
    const carId = req.params.carId;
    const temp = customerSessionmanager.getCustomerSession();
    const customer_id = temp?.customer_id ?? 1;

    // Check if the requested car belongs to the customer
    const carCheckResult = await db.query(
      `SELECT *
       FROM car
       WHERE car_id = $1 AND customer_id = $2;`,
      [carId, customer_id]
    );

    if (carCheckResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Car not found or does not belong to the customer",
      });
    }
    console.log(carId);
    console.log(customer_id);
    console.log(carCheckResult.rows);
    // Update car details
    const { car_model, car_brand, car_license, car_color } = req.body;

    console.log("Request Body:", req.body); // Log the request body
    console.log(car_model);
    console.log(car_brand);
    console.log(car_color);
    const result = await db.query(
      `UPDATE car
       SET car_model = $1,
           car_brand = $2,
           car_license = $3,
           car_color = $4
       WHERE car_id = $5
       RETURNING *;`,
      [car_model, car_brand, car_license, car_color, carId]
    );

    console.log("Update Result:", result.rows[0]); // Log the updated car details

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Failed to update car details",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Car details updated successfully",
      updatedCar: result.rows[0],
    });
    console.log("PUT OPERATION SUCCESS");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// GET the sessions  CUSTOMER AND THEIR CARS
app.get("/api/v1/customerAndCars", async (req, res) => {
  const temp = customerSessionmanager.getCustomerSession();
  const customer_id = temp?.customer_id ?? 1;

  try {
    const results = await db.query(`
      SELECT c.customer_id, 
             c.customer_first_name, 
             c.customer_last_name, 
             c.customer_ph_no, 
             c.customer_email, 
             c.customer_password, 
             c.customer_address, 
             cr.car_id,
             cr.car_brand,
             cr.car_model,
             cr.car_color,
             cr.car_license
      FROM customer c
      LEFT JOIN car cr ON c.customer_id = cr.customer_id;
    `);

    if (results.rows.length > 0) {
      const customerData = results.rows.map((row) => ({
        customer_id: row.customer_id,
        customer_first_name: row.customer_first_name,
        customer_last_name: row.customer_last_name,
        customer_ph_no: row.customer_ph_no,
        customer_email: row.customer_email,
        customer_password: row.customer_password,
        customer_address: row.customer_address,
        car_id: row.car_id,
        car_brand: row.car_brand,
        car_model: row.car_model,
        car_color: row.car_color,
        car_license: row.car_license,
      }));

      // Filter out cars if customer has no cars
      const customerCars = customerData.filter(
        (customer) => customer.customer_id === customer_id && customer.car_id
      );

      if (customerCars.length > 0) {
        res.status(200).json({
          status: "success",
          data: customerCars,
        });
      } else {
        // If no cars registered for this customer, send customer information only
        const customerInfo = customerData.find(
          (customer) => customer.customer_id === customer_id
        );
        res.status(200).json({
          status: "success",
          message: "No cars registered for this customer.",
          data: [customerInfo],
        });
      }
    } else {
      res.status(200).json({
        status: "success",
        message: "No data available.",
        data: [],
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.get("/api/v1/customerAndCars/edited", async (req, res) => {
  const temp = customerSessionmanager.getCustomerSession();
  const customer_id = temp?.customer_id ?? 1;

  try {
    const results = await db.query(`
      SELECT c.customer_id, 
             c.customer_first_name, 
             c.customer_last_name, 
             c.customer_ph_no, 
             c.customer_email, 
             c.customer_password, 
             c.customer_address, 
             cr.car_id,
             cr.car_brand,
             cr.car_model,
             cr.car_color,
             cr.car_license
      FROM customer c
      LEFT JOIN car cr ON c.customer_id = cr.customer_id;
    `);

    if (results.rows.length > 0) {
      const customers = {};
      results.rows.forEach((row) => {
        if (!customers[row.customer_id]) {
          customers[row.customer_id] = {
            customer_id: row.customer_id,
            customer_first_name: row.customer_first_name,
            customer_last_name: row.customer_last_name,
            customer_ph_no: row.customer_ph_no,
            customer_email: row.customer_email,
            customer_password: row.customer_password,
            customer_address: row.customer_address,
            cars: [],
          };
        }
        if (row.car_id) {
          customers[row.customer_id].cars.push({
            car_id: row.car_id,
            car_brand: row.car_brand,
            car_model: row.car_model,
            car_color: row.car_color,
            car_license: row.car_license,
            customer_id: row.customer_id,
          });
        }
      });

      const responseData = Object.values(customers);
      const customerInfo = responseData.find(
        (customer) => customer.customer_id === customer_id
      );

      if (customerInfo) {
        res.status(200).json({
          status: "success",
          data: [customerInfo],
        });
      } else {
        res.status(200).json({
          status: "success",
          message: "Customer not found.",
          data: [],
        });
      }
    } else {
      res.status(200).json({
        status: "success",
        message: "No data available.",
        data: [],
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.put("/api/v1/customerAndCars/edited", async (req, res) => {
  const temp = customerSessionmanager.getCustomerSession();
  const customer_id = temp?.customer_id ?? 1;

  const {
    customer_first_name,
    customer_last_name,
    customer_ph_no,
    customer_address,
    cars,
  } = req.body;
  console.log("Received customerData:", req.body);

  try {
    // Update customer information in the database
    const updateCustomerQuery = `
      UPDATE customer 
      SET customer_first_name = $1, 
          customer_last_name = $2, 
          customer_ph_no = $3, 
          customer_address = $4
      WHERE customer_id = $5
    `;
    await db.query(updateCustomerQuery, [
      customer_first_name,
      customer_last_name,
      customer_ph_no,
      customer_address,
      customer_id,
    ]);

    // console.log('Update Customer Query:', updateCustomerQuery);

    console.log(cars);
    // Update car information in the database if cars array exists
    if (cars && cars.length > 0) {
      const updateCarQueries = cars.map((car) => ({
        text: `
          UPDATE car 
          SET car_brand = $1,
              car_model = $2,
              car_color = $3,
              car_license = $4
          WHERE car_id = $5
            AND customer_id = $6
        `,
        values: [
          car.car_brand,
          car.car_model,
          car.car_color,
          car.car_license,
          car.car_id,
          customer_id,
        ],
      }));
      await Promise.all(
        updateCarQueries.map((query) => db.query(query.text, query.values))
      );
      console.log("Update Car Queries:", updateCarQueries);
      console.log("car", cars);
    } else {
      console.log("No cars to update");
    }

    // Fetch updated customer and car information from the database
    const results = await db.query(
      `
      SELECT c.customer_id, 
             c.customer_first_name, 
             c.customer_last_name, 
             c.customer_ph_no, 
             c.customer_email, 
             c.customer_password, 
             c.customer_address, 
             cr.car_id,
             cr.car_brand,
             cr.car_model,
             cr.car_color,
             cr.car_license
      FROM customer c
      LEFT JOIN car cr ON c.customer_id = cr.customer_id
      WHERE c.customer_id = $1;
    `,
      [customer_id]
    );

    // If customer exists, construct response
    if (results.rows.length > 0) {
      const customerData = results.rows.map((row) => ({
        customer_id: row.customer_id,
        customer_first_name: row.customer_first_name,
        customer_last_name: row.customer_last_name,
        customer_ph_no: row.customer_ph_no,
        customer_email: row.customer_email,
        customer_password: row.customer_password,
        customer_address: row.customer_address,
        cars: results.rows
          .filter((carRow) => carRow.car_id)
          .map((carRow) => ({
            car_id: carRow.car_id,
            car_brand: carRow.car_brand,
            car_model: carRow.car_model,
            car_color: carRow.car_color,
            car_license: carRow.car_license,
            customer_id: carRow.customer_id,
          })),
      }));

      res.status(200).json({
        status: "success",
        data: customerData,
      });
      console.log("Update Customer Result:", customerData); // Log customer update result
    } else {
      res.status(200).json({
        status: "success",
        message: "Customer not found.",
        data: [],
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

// server.js
app.put("/api/v1/customer/:id/this", async (req, res) => {
  const customerId = req.params.id;

  try {
    const {
      customer_first_name,
      customer_last_name,
      customer_ph_no,
      customer_address,
      customer_email,
    } = req.body;

    const results = await db.query(
      `UPDATE customer
          SET customer_first_name = $1,
              customer_last_name = $2,
              customer_ph_no = $3,
              customer_address = $4,
              customer_email = $5
          WHERE customer_id = $6
          RETURNING *;`,
      [
        customer_first_name,
        customer_last_name,
        customer_ph_no,
        customer_address,
        customer_email,
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
  }
});

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
      `SELECT * FROM Car
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
// Read operation for all cars
app.get("/api/v1/cars", async (req, res) => {
  try {
    const results = await db.query(`SELECT * FROM Car;`);

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
      `SELECT * FROM Car
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

// signup
app.post("/api/v1/customer/signup/this", async (req, res) => {
  try {
    const {
      customer_first_name,
      customer_last_name,
      customer_ph_no,
      customer_address,
      customer_email,
      customer_password,
    } = req.body;

    // if (!customer_name) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Customer name is required",
    //   });
    // }

    // Splitting full name into first name and last name
    // const [customer_first_name, customer_last_name] = customer_name.split(" ");

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
    // Setting customer session after successful signup
    customerSessionmanager.setCustomerSession({
      customer_id: results.rows[0].customer_id,
      customer_first_name: results.rows[0].customer_first_name,
      customer_last_name: results.rows[0].customer_last_name,
      customer_ph_no: results.rows[0].customer_ph_no,
      customer_address: results.rows[0].customer_address,
      customer_email: results.rows[0].customer_email,
    });
    console.log(customerSessionmanager.getCustomerSession(""));

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

// post("/api/v1/customer/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Retrieve customer information based on the provided username
//     const results = await db.query("SELECT * FROM customer WHERE username = $1", [
//       username,
//     ]);

//     // Check if a customer with the provided username exists
//     if (results.rows.length === 0 || results.rows[0].password !== password) {
//       return res.status(401).json({
//         status: "error",
//         message: "Invalid username or password",
//       });
//     }

//     // Customer details
//     const customerDetails = results.rows[0];

//     // Login successful, send the response
//     res.status(200).json({
//       status: "success",
//       message: "Login successful",
//       data: {
//         customer: {
//           customer_id: customerDetails.customer_id,
//           customer_first_name: customerDetails.customer_first_name,
//           customer_last_name: customerDetails.customer_last_name,
//           customer_ph_no: customerDetails.customer_ph_no,
//           customer_address: customerDetails.customer_address,
//           customer_email: customerDetails.customer_email,
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

app.post("/api/v1/customer/login", async (req, res) => {
  const { customer_email, customer_password } = req.body;

  try {
    const results = await db.query(
      `SELECT * FROM customer WHERE customer_email =  $1;`,
      [customer_email]
    );

    console.log(results.rows);
    console.log(results.rows.length === 0);
    console.log(results.rows[0].customer_password);
    console.log(customer_password);
    console.log(results.rows[0].customer_password !== customer_password);

    // Trim the provided password to remove leading and trailing spaces
    const providedPassword = customer_password.trim();

    // Trim the stored password from the database to remove leading and trailing spaces
    const storedPassword = results.rows[0].customer_password.trim();

    // Check if a customer with the provided email exists
    if (results.rows.length === 0 || storedPassword !== providedPassword) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Customer details
    const customerDetails = results.rows[0];
    // Set session data
    customerSessionmanager.setCustomerSession({
      customer_id: customerDetails.customer_id,
      customer_first_name: customerDetails.customer_first_name,
      customer_last_name: customerDetails.customer_last_name,
      customer_ph_no: customerDetails.customer_ph_no,
      // customer_address: customerDetails.customer_address,
      customer_email: customerDetails.customer_email,
    });
    console.log(customerSessionmanager.getCustomerSession(""));

    // Login successful, send the response
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        customer: {
          customer_id: customerDetails.customer_id,
          customer_first_name: customerDetails.customer_first_name,
          customer_last_name: customerDetails.customer_last_name,
          customer_ph_no: customerDetails.customer_ph_no,
          // customer_address: customerDetails.customer_address,
          customer_email: customerDetails.customer_email,
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

app.get("/api/v1/buildings", async (req, res) => {
  try {
    const buildingResults = await db.query("SELECT * FROM building");

    const buildingsList = buildingResults.rows.map((building) => ({
      building_id: building.building_id,
      building_name: building.building_name,
      building_location: building.building_location,
      // Add more fields as needed
    }));

    res.status(200).json({
      status: "success",
      data: buildingsList,
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

app.get("/api/v1/slots/:building_id", async (req, res) => {
  try {
    const { building_id } = req.params;

    const slotResults = await db.query(
      "SELECT * FROM slot WHERE building_id = $1 AND slot_status = True",
      [building_id]
    );

    const slotsList = slotResults.rows.map((slot) => ({
      slot_id: slot.slot_id,
    }));

    res.status(200).json({
      status: "success",
      data: slotsList,
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

app.get("/api/v1/getcars/:customer_id", async (req, res) => {
  try {
    const temp = customerSessionmanager.getCustomerSession();
    const customer_id = temp?.customer_id;
    console.log(customer_id);
    // const { customer_id } = req.params;

    const carResults = await db.query(
      "SELECT * FROM car WHERE customer_id = $1",
      [customer_id]
    );

    const carsList = carResults.rows.map((car) => ({
      car_id: car.car_id,
      car_brand: car.car_brand,
      car_model: car.car_model,
      car_color: car.car_color,
      car_license: car.car_license,
      customer_id: car.customer_id,
    }));

    res.status(200).json({
      status: "success",
      data: carsList,
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

// POST endpoint for creating a new session
app.post("/api/v1/sessions", async (req, res) => {
  try {
    const {
      car_id,

      building_id,
      book_time,
      slot_id,
      start_time,
    } = req.body;

    // Validate required fields
    if (!car_id || !building_id || !book_time || !start_time) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required.",
      });
    }

    // Insert new session into the database
    const newSession = await db.query(
      `
      INSERT INTO session(car_id, building_id, book_time,  start_time,slot_id)
      VALUES ($1, $2, $3, $4,$5)
      RETURNING *;
    `,
      [car_id, building_id, book_time, start_time, slot_id]
    );
    res.status(201).json({
      status: "success",
      data: newSession.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});
