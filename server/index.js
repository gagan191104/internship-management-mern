require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const internshipRoutes = require("./routes/internships");
const applicationRoutes = require("./routes/applications");
const adminRoutes = require("./routes/admin");
const employerRoutes = require("./routes/employer");

const app = express();
const PORT = process.env.PORT || 5000;

const configuredClientOrigin =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";
const isProd = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (origin === configuredClientOrigin) return callback(null, true);
      if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "internship-management-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employer", employerRoutes);

// ✅ ADD THIS BLOCK
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  if (err.message === "Only PDF resumes are allowed") {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || "Internal server error" });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
