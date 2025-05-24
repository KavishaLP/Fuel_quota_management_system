import bcrypt from "bcrypt";
import { vehicleDB } from "../config/sqldb.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configure Twilio client
const twilioClient = twilio(
  process.env.Twilio_Account_SID,
  process.env.Twilio_Auth_Token
);

// Register Employee
export const registerEmployee = (req, res) => {
  const { station_registration_number, name, email, phone, password } = req.body;

  if (!station_registration_number || !name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate phone number format
  const phoneRegex = /^\+94\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Phone number must be in format: +94XXXXXXXXX" });
  }

  vehicleDB.query(
    "SELECT * FROM employees WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error checking existing employee:", err);
        return res.status(500).json({ message: "Internal server error." });
      }

      if (results.length > 0) {
        return res
          .status(400)
          .json({ message: "Email is already registered." });
      }

      // Get fuel station name for notifications
      vehicleDB.query(
        "SELECT fuel_station_name FROM fuel_stations WHERE id = ?",
        [station_registration_number],
        (stationErr, stationResults) => {
          if (stationErr) {
            console.error("Error fetching station details:", stationErr);
            return res.status(500).json({ message: "Internal server error." });
          }

          // Fix the column name to match your database schema
          const stationName = stationResults[0]?.fuel_station_name || "Fuel Station";

          bcrypt.genSalt(10, (saltErr, salt) => {
            if (saltErr) {
              console.error("Error generating salt:", saltErr);
              return res.status(500).json({ message: "Internal server error." });
            }

            bcrypt.hash(password, salt, (hashErr, hashedPassword) => {
              if (hashErr) {
                console.error("Error hashing password:", hashErr);
                return res.status(500).json({ message: "Internal server error." });
              }

              vehicleDB.query(
                "INSERT INTO employees (station_registration_number, name, email, mobile_number, password_hash) VALUES (?, ?, ?, ?, ?)",
                [station_registration_number, name, email, phone, hashedPassword],
                (insertErr, insertResult) => {
                  if (insertErr) {
                    console.error("Error inserting employee:", insertErr);
                    return res
                      .status(500)
                      .json({ message: "Internal server error." });
                  }

                  // Temporarily skip email sending if you're having authentication issues
                  // Comment out this block if you want to skip email sending
                  const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: `Your Account Details for ${stationName}`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h1 style="color: #4a90e2; text-align: center;">Your Account at ${stationName}</h1>
                        <p>Hello ${name},</p>
                        <p>A fuel station owner has created an account for you. Below are your account details:</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                          <h3 style="margin-top: 0;">Your Complete Account Information:</h3>
                          <ul style="list-style-type: none; padding-left: 0;">
                            <li style="padding: 8px 0;"><strong>Full Name:</strong> ${name}</li>
                            <li style="padding: 8px 0;"><strong>Email Address:</strong> ${email}</li>
                            <li style="padding: 8px 0;"><strong>Phone Number:</strong> ${phone}</li>
                            <li style="padding: 8px 0;"><strong>Password:</strong> ${password}</li>
                          </ul>
                        </div>
                        <p>Please use these credentials to log in to the Fuel Quota Management System.</p>
                        <p style="color: #d32f2f;"><strong>Important:</strong> For your security, please change your password after the first login.</p>
                        <p>Thank you for joining our team!</p>
                        <p>Regards,<br>${stationName} Management</p>
                      </div>
                    `,
                  };

                  // Send email
                  transporter.sendMail(mailOptions, (emailErr) => {
                    if (emailErr) {
                      console.error("Error sending email:", emailErr);
                      // Continue with SMS even if email fails
                    } else {
                      console.log("Email notification sent to:", email);
                    }

                    // Send SMS with complete account details
                    // twilioClient.messages
                    //   .create({
                    //     body: `${stationName} Account Details - Name: ${name}, Email: ${email}, Phone: ${phone}, Password: ${password}. Please login and change your password for security.`,
                    //     from: "+12694302333",
                    //     to: phone,
                    //   })
                    //   .then(() => {
                    //     console.log("SMS notification sent to:", phone);
                    //     res.status(201).json({
                    //       message: "Employee registered successfully. Login details sent to employee.",
                    //     });
                    //   })
                    //   .catch((smsErr) => {
                    //     console.error("Error sending SMS:", smsErr);
                    //     res.status(201).json({
                    //       message: "Employee registered. Email sent but SMS notification failed.",
                    //     });
                    //   });
                  });

                }
              );
            });
          });
        }
      );
    }
  );
};


// Fetch Employee List
export const fetchEmployees = (req, res) => {
  vehicleDB.query(
    "SELECT ID, name, email, mobile_number as phone FROM employees",
    (err, results) => {
      if (err) {
        console.error("Error fetching employees:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(200).json(results);
    }
  );
};

// Update Employee
export const updateEmployee = (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  
  // Validate phone number format
  const phoneRegex = /^\+94\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Phone number must be in format: +94XXXXXXXXX" });
  }

  vehicleDB.query(
    "UPDATE employees SET name = ?, email = ?, mobile_number = ? WHERE ID = ?",
    [name, email, phone, id],
    (err) => {
      if (err) {
        console.error("Error updating employee:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(200).json({ message: "Employee updated successfully." });
    }
  );
};

// Delete Employee
export const deleteEmployee = (req, res) => {
  const { id } = req.params;

  vehicleDB.query(
    "DELETE FROM employees WHERE ID = ?",
    [id],
    (err) => {
      if (err) {
        console.error("Error deleting employee:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      res.status(200).json({ message: "Employee deleted successfully." });
    }
  );
};

// Fetch User Details
export const fetchUserDetails = (req, res) => {
  const { userId } = req.user; // Assuming userId is available in the request object

  vehicleDB.query(
    "SELECT name, email FROM users WHERE ID = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching user details:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }
      res.status(200).json(results[0]);
    }
  );
};
