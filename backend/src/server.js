const express = require("express");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Asset Management Server Running!");
});

app.get("/assets", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Canon DSLR",
      quantity: 5,
    },
    {
      id: 2,
      name: "Studio Light",
      quantity: 3,
    },
  ]);
});

app.use(express.json());

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