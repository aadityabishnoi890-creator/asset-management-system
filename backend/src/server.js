const express = require("express");
const pool = require("./db");
const bcrypt = require("bcrypt");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Asset Management Server Running!");
});

app.get("/assets", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assets ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
});

app.post("/assets", async (req, res) => {

    try {

        const {

            name,

            category,

            description,

            total_quantity,

            available_quantity

        } = req.body;

        const result = await pool.query(

            `INSERT INTO assets

            (name, category, description, total_quantity, available_quantity)

            VALUES ($1, $2, $3, $4, $5)

            RETURNING *`,

            [

                name,

                category,

                description,

                total_quantity,

                available_quantity

            ]

        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Database Error"

        });

    }

});

app.put("/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      category,
      description,
      total_quantity,
      available_quantity,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE assets
       SET name = $1,
           category = $2,
           description = $3,
           total_quantity = $4,
           available_quantity = $5,
           status = $6
       WHERE id = $7
       RETURNING *`,
      [
        name,
        category,
        description,
        total_quantity,
        available_quantity,
        status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Database Error"
    });
  }
});

app.delete("/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM assets WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    res.json({
      message: "Asset deleted successfully",
      deletedAsset: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Database Error"
    });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      branch,
      year,
      course,
      password
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
      (name, email, mobile, branch, year, course, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email`,
      [
        name,
        email,
        mobile,
        branch,
        year,
        course,
        hashedPassword
      ]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed"
    });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed"
    });
  }
});

app.post("/bookings", (req, res) => {
  const booking = req.body;

  console.log("Booking Received:");
  console.log(booking);

  res.json({
    message: "Booking Created Successfully",
    booking,
  });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});