const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "asset_management_secret";
const pool = require("./db");
const bcrypt = require("bcrypt");

const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

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
      password,
      role
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
      (name, email, mobile, branch, year, course, password_hash, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, email, role`,
      [
        name,
        email,
        mobile || null,
        branch || null,
        year || null,
        course || null,
        hashedPassword,
        role || "user"
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

    const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);

res.json({
  message: "Login successful",
  token,
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

app.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
});

app.post("/bookings", async (req, res) => {
  try {
    const {
      asset_id,
      user_id,
      quantity,
      purpose,
      start_date,
      end_date
    } = req.body;

    const assetResult = await pool.query(
      "SELECT * FROM assets WHERE id = $1",
      [asset_id]
    );

    if (assetResult.rows.length === 0) {
      return res.status(404).json({
        message: "Asset not found"
      });
    }

    const asset = assetResult.rows[0];

    if (asset.available_quantity < quantity) {
      return res.status(400).json({
        message: "Not enough quantity available"
      });
    }

    const bookingResult = await pool.query(
      `INSERT INTO bookings
      (
        asset_id,
        user_id,
        quantity,
        purpose,
        start_date,
        end_date,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *`,
      [
        asset_id,
        user_id,
        quantity,
        purpose,
        start_date,
        end_date
      ]
    );

    res.status(201).json({
      message: "Booking request submitted",
      booking: bookingResult.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Booking creation failed"
    });
  }
});

app.patch("/bookings/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_by } = req.body;

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be approved"
      });
    }

    const assetResult = await pool.query(
      "SELECT * FROM assets WHERE id = $1",
      [booking.asset_id]
    );

    const asset = assetResult.rows[0];

    if (asset.available_quantity < booking.quantity) {
      return res.status(400).json({
        message: "Not enough quantity available"
      });
    }

    await pool.query(
      `UPDATE assets
       SET available_quantity = available_quantity - $1
       WHERE id = $2`,
      [booking.quantity, booking.asset_id]
    );

    const updatedBooking = await pool.query(
      `UPDATE bookings
       SET status = 'approved',
           approved_by = $1
       WHERE id = $2
       RETURNING *`,
      [approved_by, id]
    );

    res.json({
      message: "Booking approved successfully",
      booking: updatedBooking.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Booking approval failed"
    });
  }
});

app.patch("/bookings/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be rejected"
      });
    }

    const updatedBooking = await pool.query(
      `UPDATE bookings
       SET status = 'rejected'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: "Booking rejected successfully",
      booking: updatedBooking.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Booking rejection failed"
    });
  }
});

app.patch("/bookings/:id/issue", async (req, res) => {
  try {
    const { id } = req.params;

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== "approved") {
      return res.status(400).json({
        message: "Only approved bookings can be issued"
      });
    }

    const updatedBooking = await pool.query(
      `UPDATE bookings
       SET status = 'issued',
           issued_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: "Asset issued successfully",
      booking: updatedBooking.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Asset issue failed" });
  }
});

app.patch("/bookings/:id/return", async (req, res) => {
  try {
    const { id } = req.params;

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== "issued") {
      return res.status(400).json({
        message: "Only issued bookings can be returned"
      });
    }

    // Increase asset quantity back
    await pool.query(
      `UPDATE assets
       SET available_quantity = available_quantity + $1
       WHERE id = $2`,
      [booking.quantity, booking.asset_id]
    );

    const updatedBooking = await pool.query(
      `UPDATE bookings
       SET status = 'returned',
           returned_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: "Asset returned successfully",
      booking: updatedBooking.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Asset return failed"
    });
  }
});

app.get("/bookings/my/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT bookings.*, assets.name AS asset_name, assets.category
       FROM bookings
       JOIN assets ON bookings.asset_id = assets.id
       WHERE bookings.user_id = $1
       ORDER BY bookings.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bookings.*, users.name AS user_name, assets.name AS asset_name
       FROM bookings
       JOIN users ON bookings.user_id = users.id
       JOIN assets ON bookings.asset_id = assets.id
       ORDER BY bookings.created_at DESC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

app.get("/dashboard/stats", async (req, res) => {
  try {
    const totalAssets = await pool.query(
      "SELECT COUNT(*) FROM assets"
    );

    const availableInventory = await pool.query(
      "SELECT SUM(available_quantity) FROM assets"
    );

    const activeBookings = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE status IN ('approved', 'issued')"
    );

    const overdueReturns = await pool.query(
      `SELECT COUNT(*) FROM bookings
       WHERE status = 'issued' AND end_date < CURRENT_DATE`
    );

    const mostUsedAssets = await pool.query(
      `SELECT assets.name, COUNT(bookings.id) AS booking_count
       FROM bookings
       JOIN assets ON bookings.asset_id = assets.id
       GROUP BY assets.name
       ORDER BY booking_count DESC`
    );

    res.json({
      total_assets: Number(totalAssets.rows[0].count),
      available_inventory: Number(availableInventory.rows[0].sum),
      active_bookings: Number(activeBookings.rows[0].count),
      overdue_returns: Number(overdueReturns.rows[0].count),
      most_used_assets: mostUsedAssets.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats"
    });
  }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});