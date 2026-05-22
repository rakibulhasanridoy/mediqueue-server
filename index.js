const express = require('express');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = process.env.MONGODB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Custom JWT / Session Verification Middleware
const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ error: "Unauthorized access: Token missing or invalid" });
  }
  const token = authHeader.split(" ")[1];
  try {
    // If the token is a JWT, it will contain three sections separated by dots
    if (token.includes(".")) {
      const payloadBase64 = token.split(".")[1];
      const decoded = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
      req.user = {
        id: decoded.sub || decoded.userId || decoded.id,
        email: decoded.email,
        name: decoded.name
      };
      next();
    } else {
      // Fallback: Query Better Auth session in database
      const db = client.db("mentoradb");
      const session = await db.collection("session").findOne({ token });
      if (!session) {
        return res.status(401).send({ error: "Unauthorized access: Session invalid" });
      }
      const user = await db.collection("user").findOne({ id: session.userId });
      if (!user) {
        return res.status(401).send({ error: "Unauthorized access: User not found" });
      }
      req.user = {
        id: user.id || user._id.toString(),
        email: user.email,
        name: user.name
      };
      next();
    }
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(401).send({ error: "Unauthorized access: Token verification failed" });
  }
};

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    const db = client.db("MediQueue");
    const tutorsCollection = db.collection('tutors');
    const enrollmentsCollection = db.collection('enrollments');

    // TEMPORARY FIX — Delete this route after running it once
    app.get("/fix-thumbnails", async (req, res) => {
      const result = await tutorsCollection.updateMany(
        { thumbnail: { $regex: "1594824813573" } },
        { $set: { thumbnail: "" } }
      );
      res.send(result);
    });

    // 1. Featured Tutors (Limit 6)
    app.get("/tutors/featured", async (req, res) => {
      try {
        const cursor = tutorsCollection.find({}).limit(6);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // 2. All Tutors with Regex search (name) and Date Filters ($gte, $lte)
    app.get("/tutors", async (req, res) => {
      try {
        const { search, startDateGte, startDateLte } = req.query;
        const query = {};

        // Case-insensitive regex search on tutor's name
        if (search) {
          query.title = { $regex: search, $options: "i" };
        }

        // Registration/session start date filtering using $gte and $lte
        if (startDateGte || startDateLte) {
          query.startDate = {};
          if (startDateGte) {
            query.startDate.$gte = startDateGte;
          }
          if (startDateLte) {
            query.startDate.$lte = startDateLte;
          }
        }

        const cursor = tutorsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // 3. Single Tutor details
    app.get("/tutors/:tutorId", async (req, res) => {
      try {
        const { tutorId } = req.params;
        const query = { _id: new ObjectId(tutorId) };
        const result = await tutorsCollection.findOne(query);
        if (!result) {
          return res.status(404).send({ error: "Tutor profile not found" });
        }
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // 4. Create Tutor (Private)
    app.post("/tutors", verifyJWT, async (req, res) => {
      try {
        const tutorData = req.body;
        tutorData.ownerEmail = req.user.email;
        tutorData.totalSlot = parseInt(tutorData.totalSlot) || 0;
        tutorData.price = tutorData.price || "0";
        tutorData.rating = 5.0; // default rating
        tutorData.reviewsCount = 0;
        tutorData.successRate = "100%";
        tutorData.sessionsCount = "0";

        const result = await tutorsCollection.insertOne(tutorData);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // 5. Update Tutor Details (Private)
    app.put("/tutors/:id", verifyJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const tutor = await tutorsCollection.findOne(query);
        if (!tutor) {
          return res.status(404).send({ error: "Tutor not found" });
        }
        if (tutor.ownerEmail !== req.user.email) {
          return res.status(403).send({ error: "Forbidden: You are not the owner of this tutor profile" });
        }

        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.ownerEmail;
        updateData.totalSlot = parseInt(updateData.totalSlot) || 0;

        const result = await tutorsCollection.updateOne(query, { $set: updateData });
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // 6. Delete Tutor Profile (Private)
    app.delete("/tutors/:id", verifyJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const tutor = await tutorsCollection.findOne(query);
        if (!tutor) {
          return res.status(404).send({ error: "Tutor not found" });
        }
        if (tutor.ownerEmail !== req.user.email) {
          return res.status(403).send({ error: "Forbidden: You are not the owner of this tutor profile" });
        }

        const result = await tutorsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // 7. Book a Session (Private)
    app.post("/enrollments", verifyJWT, async (req, res) => {
      try {
        const { tutorId, studentName, studentPhone } = req.body;
        const tutorQuery = { _id: new ObjectId(tutorId) };
        const tutor = await tutorsCollection.findOne(tutorQuery);
        if (!tutor) {
          return res.status(404).send({ error: "Tutor not found" });
        }

        // Slot Check
        if (tutor.totalSlot <= 0) {
          return res.status(400).send({ error: "No available slots left. This session is fully booked. You can't join at the moment." });
        }

        // Session Date check (booking not allowed before session start date)
        const currentDate = new Date().toISOString().split("T")[0];
        if (currentDate < tutor.startDate) {
          return res.status(400).send({ error: "Booking is not available yet for this tutor." });
        }

        // Auto decrease slot by 1
        await tutorsCollection.updateOne(tutorQuery, { $inc: { totalSlot: -1 } });

        const newBooking = {
          tutorId: tutor._id.toString(),
          tutorName: tutor.title,
          studentName: studentName,
          studentEmail: req.user.email,
          studentPhone: studentPhone,
          status: "Pending", // Auto-generated Book Status
          createdAt: new Date().toISOString()
        };

        const result = await enrollmentsCollection.insertOne(newBooking);
        res.status(201).send(result);
      } catch (error) {
        console.error("Booking failed:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // 8. Fetch User's Bookings (Private)
    app.get("/enrollments/:userId", verifyJWT, async (req, res) => {
      try {
        // Find bookings matching currently authenticated user's email
        const result = await enrollmentsCollection.find({ studentEmail: req.user.email }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // 9. Cancel a Booked Session (Private - PATCH)
    app.patch("/enrollments/:id", verifyJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const booking = await enrollmentsCollection.findOne(query);
        if (!booking) {
          return res.status(404).send({ error: "Booking session not found" });
        }
        if (booking.studentEmail !== req.user.email) {
          return res.status(403).send({ error: "Forbidden: You are not authorized to cancel this booking" });
        }

        const result = await enrollmentsCollection.updateOne(query, { $set: { status: "cancelled" } });
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });

  } catch (error) {
    console.error("Database connection error during startup:", error);
  }
}

// Initialize
run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
  res.send('MediQueue Server is running smoothly!');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});