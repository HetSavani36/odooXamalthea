import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import { Sport } from "./models/sport.model.js";
import { Facility } from "./models/facility.model.js";
import { Court } from "./models/court.model.js";
import { Booking } from "./models/booking.model.js";
import { Review } from "./models/review.model.js";
import { Report } from "./models/report.model.js";
import { configDotenv } from "dotenv";

configDotenv();

const MONGO_URI = process.env.MONGO_URL || "";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    // ------------------- USERS -------------------
    const usersData = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "user",
      },
      {
        name: "Owner One",
        email: "owner1@example.com",
        password: "password123",
        role: "owner",
      },
      {
        name: "Owner Two",
        email: "owner2@example.com",
        password: "password123",
        role: "owner",
      },
      {
        name: "Super Admin",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      },
    ];

    const users = [];
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) user = await User.create(u);
      users.push(user);
    }
    const [user1, user2, owner1, owner2, admin] = users;
    console.log("Users seeded");

    // ------------------- SPORTS -------------------
    const sportsData = [
      { name: "Football", type: "outdoor" },
      { name: "Tennis", type: "outdoor" },
      { name: "Badminton", type: "indoor" },
      { name: "Basketball", type: "outdoor" },
    ];

    const sports = [];
    for (const s of sportsData) {
      let sport = await Sport.findOne({ name: s.name });
      if (!sport) sport = await Sport.create(s);
      sports.push(sport);
    }
    const [football, tennis, badminton, basketball] = sports;
    console.log("Sports seeded");

    // ------------------- FACILITIES -------------------
    const facilitiesData = [
      {
        owner: owner1._id,
        name: "City Sports Complex",
        description: "Large multi-sport complex",
        address: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        sports: [football._id, tennis._id],
        amenities: ["Parking", "Drinking Water", "Restrooms"],
        photos: ["facility1a.jpg", "facility1b.jpg"],
        location: { type: "Point", coordinates: [72.8777, 19.076] },
        status: "approved",
      },
      {
        owner: owner2._id,
        name: "Elite Indoor Arena",
        description: "Premium indoor sports center",
        address: "45 Sports Avenue",
        city: "Delhi",
        state: "Delhi",
        country: "India",
        sports: [badminton._id, basketball._id],
        amenities: ["Cafeteria", "AC halls", "Locker Rooms"],
        photos: ["facility2a.jpg"],
        location: { type: "Point", coordinates: [77.1025, 28.7041] },
        status: "approved",
      },
    ];

    const facilities = [];
    for (const f of facilitiesData) {
      let facility = await Facility.findOne({ name: f.name });
      if (!facility) facility = await Facility.create(f);
      facilities.push(facility);
    }
    const [facility1, facility2] = facilities;
    console.log("Facilities seeded");

    // ------------------- COURTS -------------------
    const courtsData = [
      {
        facility: facility1._id,
        name: "Football Ground A",
        sport: football._id,
        type: "outdoor",
        operatingHours: [
          { weekday: 1, open: "06:00", close: "22:00", pricePerHour: 1000 },
        ],
      },
      {
        facility: facility1._id,
        name: "Tennis Court A",
        sport: tennis._id,
        type: "outdoor",
        operatingHours: [
          { weekday: 1, open: "07:00", close: "21:00", pricePerHour: 700 },
        ],
      },
      {
        facility: facility2._id,
        name: "Badminton Court 1",
        sport: badminton._id,
        type: "indoor",
        operatingHours: [
          { weekday: 2, open: "08:00", close: "23:00", pricePerHour: 400 },
        ],
      },
      {
        facility: facility2._id,
        name: "Basketball Court 1",
        sport: basketball._id,
        type: "indoor",
        operatingHours: [
          { weekday: 3, open: "09:00", close: "22:00", pricePerHour: 600 },
        ],
      },
    ];

    const courts = [];
    for (const c of courtsData) {
      let court = await Court.findOne({ name: c.name });
      if (!court) court = await Court.create(c);
      courts.push(court);
    }
    const [court1, court2, court3, court4] = courts;
    console.log("Courts seeded");

    // ------------------- BOOKINGS -------------------
    const bookingsData = [
      {
        user: user1._id,
        facility: facility1._id,
        court: court2._id,
        sport: tennis._id,
        startAt: new Date(Date.now() + 60 * 60 * 1000),
        endAt: new Date(Date.now() + 2 * 60 * 1000),
        durationHours: 1,
        price: 700,
        status: "confirmed",
        payment: {
          method: "upi",
          amount: 700,
          transactionId: "TXN1001",
          status: "success",
        },
      },
      {
        user: user2._id,
        facility: facility2._id,
        court: court3._id,
        sport: badminton._id,
        startAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
        durationHours: 1,
        price: 400,
        status: "confirmed",
        payment: {
          method: "card",
          amount: 400,
          transactionId: "TXN1002",
          status: "success",
        },
      },
    ];

    for (const b of bookingsData) {
      const exists = await Booking.findOne({
        user: b.user,
        court: b.court,
        startAt: b.startAt,
      });
      if (!exists) await Booking.create(b);
    }
    console.log("Bookings seeded");

    // ------------------- REVIEWS -------------------
    const reviewsData = [
      {
        user: user1._id,
        facility: facility1._id,
        court: court2._id,
        rating: 5,
        comment: "Amazing tennis court, very well maintained!",
      },
      {
        user: user2._id,
        facility: facility2._id,
        court: court3._id,
        rating: 4,
        comment: "Good experience, but court was a bit slippery.",
      },
    ];

    for (const r of reviewsData) {
      const exists = await Review.findOne({ user: r.user, court: r.court });
      if (!exists) await Review.create(r);
    }
    console.log("Reviews seeded");

    // ------------------- REPORTS -------------------
    const reportsData = [
      {
        reporter: user1._id,
        targetFacility: facility2._id,
        reason: "Pricing was higher than listed",
        evidence: ["report1.jpg"],
      },
      {
        reporter: user2._id,
        targetFacility: facility1._id,
        reason: "Court was not available at booked time",
        evidence: ["report2.jpg"],
      },
    ];

    for (const r of reportsData) {
      const exists = await Report.findOne({
        reporter: r.reporter,
        targetFacility: r.targetFacility,
        reason: r.reason,
      });
      if (!exists) await Report.create(r);
    }
    console.log("Reports seeded");

    console.log("🌱 Seeding completed successfully (idempotent)");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();

