const express = require("express");
const pool = require("./db");

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