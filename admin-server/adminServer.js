require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();

const pool = require("./db/index.js");
app.use(express.json());
app.use(cors());
const port_number = process.env.PORT || 5001;
app.listen(port_number, () => {
  console.log(`Server is up on ${port_number}`);
});

// get customer data
app.get("/customer", async (req, res) => {
  try {
    //Fetch customer data
    const getCustomer = await pool.query("SELECT * FROM customer");

    //Fetch car data associated with each customer
    const customers = getCustomer.rows;
    for (const customer of customers) {
      const getCustomerCar = await pool.query(
        "SELECT * FROM car WHERE customer_id = $1",
        [customer.customer_id]
      );
      customer.cars = getCustomerCar.rows;
    }
    res.json(customers);
  } catch (error) {
    console.log(error);
  }
});

//get one customer
app.get("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch customer data for the given ID
    const getCustomerByID = await pool.query(
      "SELECT * FROM customer WHERE customer_id = $1",
      [id]
    );
    const customer = getCustomerByID.rows[0]; // Assuming there's only one customer with the given ID

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Fetch car data associated with the customer
    const getCustomerCarByID = await pool.query(
      "SELECT * FROM car WHERE customer_id = $1",
      [id]
    );
    const cars = getCustomerCarByID.rows;

    // Attach car data to the customer object
    customer.cars = cars;

    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get staff data
app.get("/staff", async (req, res) => {
  try {
    //Fetch staff data
    const getStaff = await pool.query(
      "SELECT * FROM staff ORDER BY staff_id ASC"
    );

    //Fetch buidling data associated with each staff
    const staffs = getStaff.rows;
    for (const staff of staffs) {
      const getStaffBuilding = await pool.query(
        "SELECT * FROM building WHERE building_id = $1",
        [staff.building_id]
      );
      staff.buildings = getStaffBuilding.rows;
    }
    res.json(staffs);
  } catch (error) {
    console.log(error);
  }
});

// get staff data by id
app.get("/staff/:id", async (req, res) => {
  try {
    //Fetch staff data
    const { id } = req.params;
    const getStaff = await pool.query(
      "SELECT * FROM staff WHERE staff_id = $1",
      [id]
    );

    //Fetch buidling data associated with each staff
    const staffs = getStaff.rows;
    for (const staff of staffs) {
      const getStaffBuilding = await pool.query(
        "SELECT * FROM building WHERE building_id = $1",
        [staff.building_id]
      );
      staff.buildings = getStaffBuilding.rows;
    }
    res.json(staffs);
  } catch (error) {
    console.log(error);
  }
});

// create staff
app.post("/staff", async (req, res) => {
  try {
    const {
      staff_first_name,
      staff_last_name,
      staff_ph_no,
      staff_address,
      staff_email,
      staff_password,
      building_name,
    } = req.body;

    // Logging: Print out the values of variables
    console.log("Received request body:", req.body);
    console.log("First Name:", staff_first_name);
    console.log("Last Name:", staff_last_name);
    console.log("Phone:", staff_ph_no);
    console.log("Address:", staff_address);
    console.log("Email:", staff_email);
    console.log("Password:", staff_password);
    console.log("Building:", building_name);

    // Check if the email already exists
    const emailCheck = await pool.query(
      "SELECT * FROM staff WHERE staff_email = $1",
      [staff_email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Get building_id from building_name
    const buildingQuery =
      "SELECT building_id FROM building WHERE building_name = $1";
    const buildingResult = await pool.query(buildingQuery, [building_name]);

    // Logging: Print out the result of the query
    console.log("Building Result:", buildingResult.rows);

    if (buildingResult.rows.length === 0) {
      return res.status(404).json({ error: "Building not found." });
    }
    const building_id = buildingResult.rows[0].building_id;

    // Insert new staff member
    const insertQuery =
      "INSERT INTO staff (staff_first_name, staff_last_name, staff_ph_no, staff_address, staff_email, staff_password, building_id) VALUES ($1, $2, $3, $4, $5, $6, $7)";
    const values = [
      staff_first_name,
      staff_last_name,
      staff_ph_no,
      staff_address,
      staff_email,
      staff_password,
      building_id,
    ];
    await pool.query(insertQuery, values);

    res.status(201).json({ message: "Staff created successfully." });
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({ error: "An error occurred while adding staff." });
  }
});

// delete staff by id
app.delete("/staff/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Get the building ID associated with the staff member being deleted
    const buildingIdResult = await pool.query(
      "SELECT building_id FROM staff WHERE staff_id = $1",
      [id]
    );

    if (buildingIdResult.rows.length === 0) {
      return res.status(404).json({ error: "Staff member not found." });
    }

    const buildingId = buildingIdResult.rows[0].building_id;

    // Check how many staff members are working in the building
    const checkTotalStaffWorking = await pool.query(
      `
            SELECT COUNT(*) AS num_staff_in_building
            FROM staff
            WHERE building_id = $1`,
      [buildingId]
    );

    const numStaffInBuilding =
      checkTotalStaffWorking.rows[0].num_staff_in_building;
    console.log("Number of staff in building:", numStaffInBuilding);
    console.log("Building ID:", buildingId);
    console.log(numStaffInBuilding === 1);
    if (parseInt(numStaffInBuilding) === 1) {
      // If there is only one staff member in the building, send a warning response
      return res.status(404).json({
        error:
          "There is only one staff in this building. Cannot delete the last staff.",
      });
    } else {
      // If there are more than one staff member in the building, proceed with deletion
      const deleteStaff = await pool.query(
        "DELETE FROM staff WHERE staff_id = $1",
        [id]
      );
      return res.json("Staff deleted successfully");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred while deleting staff." });
  }
});

// delete staff and building on building id
app.delete("/staff/building/:buildingid", async (req, res) => {
  try {
    const { buildingid } = req.params;

    // Get staff working in that building
    const getStaff = await pool.query(
      "SELECT staff_id FROM staff WHERE building_id = $1",
      [buildingid]
    );

    // Check if there are staff members associated with the building
    if (getStaff.rows.length === 0) {
      // If no staff found, delete the building directly
      await pool.query("DELETE FROM building WHERE building_id = $1", [
        buildingid,
      ]);
      return res.json({ message: "Building deleted successfully." });
    }

    // Delete staff working in the building
    await Promise.all(
      getStaff.rows.map(async (staff) => {
        await pool.query("DELETE FROM staff WHERE staff_id = $1", [
          staff.staff_id,
        ]);
      })
    );

    // Delete the building
    await pool.query("DELETE FROM building WHERE building_id = $1", [
      buildingid,
    ]);

    res.json({ message: "Staff and building deleted successfully." });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "An error occurred while deleting staff and building." });
  }
});

// update staff by id
app.put("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      staff_first_name,
      staff_last_name,
      staff_ph_no,
      staff_address,
      staff_email,
      staff_password,
      building_name,
    } = req.body;

    // checking if staff exists
    const getStaffbyID = await pool.query(
      "SELECT * FROM staff WHERE staff_id = $1",
      [id]
    );
    if (getStaffbyID.rows.length === 0) {
      return res.status(400).json({ error: "Staff doesn't exist" });
    }

    //checking if the new email already exists in the database
    const emailCheck = await pool.query(
      "SELECT * FROM staff WHERE staff_email = $1 AND staff_id != $2",
      [staff_email, id]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists." });
    }

    //checking if building exists
    const buildingQuery =
      "SELECT building_id FROM building WHERE building_name = $1";
    const buildingResult = await pool.query(buildingQuery, [building_name]);

    if (buildingResult.rows.length === 0) {
      return res.status(404).json({ error: "Building not found." });
    }
    const building_id = buildingResult.rows[0].building_id;

    //checking if last staff in the building
    const buildingIdQueryResult = await pool.query(
      "SELECT building_id FROM staff WHERE staff_id = $1",
      [id]
    );
    const buildingId = buildingIdQueryResult.rows[0].building_id;

    const numStaffInBuildingResult = await pool.query(
      "SELECT COUNT(*) AS num_staff_in_building FROM staff WHERE building_id = $1",
      [buildingId]
    );
    const numStaffInBuilding =
      numStaffInBuildingResult.rows[0].num_staff_in_building;

    if (parseInt(numStaffInBuilding) === 1) {
      return res.status(404).json({
        error:
          "There is only one staff in this building. Cannot update the last staff.",
      });
    }

    // Updating staff
    const updateQuery =
      "UPDATE staff SET staff_first_name = $1, staff_last_name = $2, staff_ph_no= $3, staff_address = $4, staff_email = $5, staff_password = $6, building_id = $7 WHERE staff_id = $8";
    const values = [
      staff_first_name,
      staff_last_name,
      staff_ph_no,
      staff_address,
      staff_email,
      staff_password,
      building_id,
      id,
    ];
    await pool.query(updateQuery, values);
    res.status(200).json({ message: "Staff updated successfully." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred while updating staff." });
  }
});

// getting all building data
app.get("/building", async (req, res) => {
  try {
    const getBuilding = await pool.query(
      "SELECT * FROM building ORDER BY building_name ASC"
    );
    res.json(getBuilding.rows);
  } catch (error) {
    console.log(error.message);
  }
});

//get building by id
app.get("/building/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const getBuildingbyID = await pool.query(
      "SELECT * FROM building WHERE building_id = $1",
      [id]
    );
    res.json(getBuildingbyID.rows);
  } catch (error) {
    console.log(error.message);
  }
});

//adding new building
app.post("/building", async (req, res) => {
  try {
    const {
      building_name,
      building_address,
      building_capacity,
      price_per_min,
    } = req.body;

    // Check if building name already exists
    const buildingName = await pool.query(
      "SELECT * FROM building WHERE building_name = $1",
      [building_name]
    );
    if (buildingName.rows.length > 0) {
      return res.status(400).json({ error: "Building name already exists." });
    }

    // Add new building
    const newBuilding = await pool.query(
      "INSERT INTO building (building_name, building_address, building_capacity, price_per_min) VALUES ($1, $2, $3, $4)",
      [building_name, building_address, building_capacity, price_per_min]
    );
    res.status(201).json({ message: "Building created successfully." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred while adding building." });
  }
});

// //deleting a selected building
// app.delete('/building/:id', async (req, res) => {
//     try {
//         const { id } = req.params;

//         const checkStaff = await pool.query("SELECT * FROM staff WHERE staff.building_id = $1", [id]);
//         console.log(checkStaff.rows.length);
//         if (checkStaff.rows.length > 0) {
//             return res.status(409).json({error: "There are staffs working in that building"});
//         }

//         // Check if any building was deleted
//         const deleteBuilding = await pool.query("DELETE FROM building WHERE building_id = $1", [id]);
//         if (deleteBuilding.rowCount === 0) {
//             return res.status(404).json({ error: "Building not found." });
//         }

//         // Send success response
//         res.status(200).json({ message: "Building deleted successfully." });
//     } catch (error) {
//         console.error("Error deleting building:", error.message);
//         res.status(500).json({ error: "An error occurred while deleting building." });
//     }
// });

// delete staff and building on building id
// app.delete('/building/:buildingid', async (req, res) => {
//     try {
//         const { buildingid } = req.params;

//         // Delete the building
//         await pool.query('DELETE FROM building WHERE building_id = $1', [buildingid]);

//         res.json({ message: 'Building deleted successfully.' });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ error: 'An error occurred while deleting the building.' });
//     }
// });

//updating a selected building
app.put("/building/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      building_name,
      building_address,
      building_capacity,
      price_per_min,
    } = req.body;

    // Check if building name already exists
    const buildingName = await pool.query(
      "SELECT * FROM building WHERE building_name = $1 AND building_id != $2",
      [building_name, id]
    );
    if (buildingName.rows.length > 0) {
      return res.status(400).json({ error: "Building already exists." });
    }

    // Upadting the building
    const updateBuilding = await pool.query(
      "UPDATE building SET building_name = $1, building_address = $2, building_capacity = $3, price_per_min = $4 WHERE building_id = $5",
      [building_name, building_address, building_capacity, price_per_min, id]
    );
    res.status(200).json({ message: "Building updated sucessfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occured while updating building" });
  }
});

app.get("/sessions/history", async (req, res) => {
  try {
    const results = await pool.query(
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
       
        end_time IS NOT NULL
    ORDER BY 
        session.end_time DESC;
    
         `
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
app.get("/api/buildings/:buildingId/unverified-sessions", async (req, res) => {
  const buildingId = parseInt(req.params.buildingId, 10); // Parse the parameter as an integer

  try {
    let query = `SELECT session.*,building.building_name, CONCAT(customer.customer_first_name, ' ', customer.customer_last_name) AS owner_name, 
                  CONCAT(car.car_license, ' ', COALESCE(car.car_model, ''), ' ', COALESCE(car.car_color, '')) AS car_info,
                  TO_CHAR(session.arrival_time, 'YYYY-MM-DD HH24:MI') AS arrival_time,
                  TO_CHAR(session.end_time, 'YYYY-MM-DD HH24:MI') AS end_time,
                  TO_CHAR(session.book_time, 'YYYY-MM-DD HH24:MI') AS book_time,
                  customer.customer_id
                  FROM session
                  JOIN car ON session.car_id = car.car_id
                  JOIN building on building.building_id= session.building_id
                  JOIN customer ON car.customer_id = customer.customer_id`;

    if (!isNaN(buildingId)) {
      // Check if buildingId is a valid integer
      query += ` WHERE session.building_id = $1 AND session.staff_auth = 'unverified'`;
    } else {
      query += ` WHERE session.staff_auth = 'unverified'`;
    }

    query += ` ORDER BY session.book_time ASC`;

    const results = await pool.query(
      query,
      !isNaN(buildingId) ? [buildingId] : []
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
});

app.get("/buildings/:buildingId/accepted-sessions", async (req, res) => {
  // const temp = sessionManager.getSession();
  // if (temp) {
  //   const staffId = temp.staff_first_name;
  //   console.log(staffId);
  // } else {
  //   console.log("thjere is no session");
  // }
  // Get buildingId from the sessionManager
  // const buildingId = temp?.building_id ?? 1;

  try {
    // if (!buildingId) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Building ID not found in the session",
    //   });
    // }
    const results = await pool.query(
      `SELECT session.*, building.building_name,CONCAT(customer.customer_first_name, ' ', customer.customer_last_name) AS owner_name, 
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
          JOIN building ON session.building_id = building.building_id
          WHERE 
           session.staff_auth = 'accepted'
          AND arrival_time IS null
          ORDER BY session.book_time ASC;`
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
  try {
    const results = await pool.query(
      `SELECT session.*, building.building_name,CONCAT(customer.customer_first_name, ' ', customer.customer_last_name) AS owner_name, 
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
          JOIN building ON building.building_id = session.building_id
          WHERE 
           session.staff_auth = 'accepted'
          AND arrival_time IS NOT null
          AND end_time IS null
          ORDER BY session.book_time ASC;`
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
