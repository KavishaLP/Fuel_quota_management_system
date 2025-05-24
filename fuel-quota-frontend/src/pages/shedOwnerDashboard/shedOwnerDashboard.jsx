/* eslint-disable no-unused-vars */


import React, { useState, useEffect } from "react";
import withAuth2 from "../withAuth2";
import "./shedOwnerDashboard.css";

const ShedOwnerDashboard = ({ userId, authToken }) => {
  const [activeSection, setActiveSection] = useState("addEmployee");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePhone, setEmployeePhone] = useState(""); // New state for phone number
  const [phoneError, setPhoneError] = useState(""); // For phone validation errors
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);


const validatePhoneNumber = (phone) => {
  // Sri Lankan phone numbers in international format: +94 followed by 9 digits
  // The first digit after +94 should be 7 for mobile numbers
  const phoneRegex = /^\+94\d{9}$/;
  
  if (!phoneRegex.test(phone)) {
    setPhoneError("Phone number must be in format: +94XXXXXXXXX");
    return false;
  }
  
  setPhoneError("");
  return true;
};  

// Add this function near your other utility functions
const formatPhoneNumber = (phone) => {
  // If number starts with 0, replace it with +94
  if (phone.startsWith('0')) {
    return '+94' + phone.substring(1);
  }
  // If it doesn't start with +94, add it
  else if (!phone.startsWith('+94')) {
    return '+94' + phone;
  }
  return phone;
};

  // Register Employee
  const handleRegisterEmployee = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    
    if (!validatePhoneNumber(employeePhone)) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/shedownerapi/register-employee",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            station_registration_number: userId,
            name: employeeName,
            email: employeeEmail,
            phone: employeePhone, // Add phone to request
            password: password,
          }),
        }
      );

      if (response.ok) {
        setMessage("Employee registered successfully!");
        setEmployeeName("");
        setEmployeeEmail("");
        setEmployeePhone(""); // Reset phone
        setPassword("");
        setConfirmPassword("");
        fetchEmployeeList(); // Refresh the employee list
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to register employee.");
      }
    } catch (error) {
      setMessage("An error occurred while registering the employee.");
    }
  };

  // Fetch Employee List
  const fetchEmployeeList = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/shedownerapi/employees",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEmployeeList(data);
        setMessage(""); // Clear any previous error messages
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to fetch employee list.");
      }
    } catch (error) {
      setMessage("An error occurred while fetching the employee list.");
    }
  };

  // Fetch User Details
  // const fetchUserDetails = async () => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:5000/shedownerapi/user-details",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     );
  //     if (response.ok) {
  //       const data = await response.json();
  //       setUserDetails(data);
  //     } else {
  //       setMessage("Failed to fetch user details.");
  //     }
  //   } catch (error) {
  //     setMessage("An error occurred while fetching user details.");
  //   }
  // };

  // Update Employee
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (!validatePhoneNumber(selectedEmployee.phone)) {
      return;
    }
    
    try {
      const response = await fetch(
        `http://localhost:5000/shedownerapi/employees/${selectedEmployee.ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(selectedEmployee),
        }
      );
      if (response.ok) {
        setMessage("Employee updated successfully!");
        setIsUpdateModalOpen(false);
        fetchEmployeeList();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to update employee.");
      }
    } catch (error) {
      setMessage("An error occurred while updating the employee.");
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/shedownerapi/employees/${selectedEmployee.ID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.ok) {
        setMessage("Employee deleted successfully!");
        setIsDeleteModalOpen(false);
        fetchEmployeeList();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to delete employee.");
      }
    } catch (error) {
      setMessage("An error occurred while deleting the employee.");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    // fetchUserDetails();
    fetchEmployeeList();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-brand">FuelQuota - Shed Owner Dashboard</div>
        <div className="navbar-user">
          Welcome, {userDetails ? userDetails.name : "Loading..."}
        </div>
      </div>

      {/* Sidebar and Main Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div
            className={`sidebar-item ${
              activeSection === "addEmployee" ? "active" : ""
            }`}
            onClick={() => setActiveSection("addEmployee")}
          >
            Add Employee
          </div>
          <div
            className={`sidebar-item ${
              activeSection === "employeeList" ? "active" : ""
            }`}
            onClick={() => {
              setActiveSection("employeeList");
              fetchEmployeeList();
            }}
          >
            Employee List
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {activeSection === "addEmployee" && (
            <div className="employee-form-container">
              <h2>Register Employee</h2>
              <form onSubmit={handleRegisterEmployee}>
                <div className="form-group">
                  <label htmlFor="employeeName">Employee Name:</label>
                  <input
                    type="text"
                    id="employeeName"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="employeeEmail">Employee Email:</label>
                  <input
                    type="email"
                    id="employeeEmail"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="employeePhone">Employee Phone:</label>
                  <input
                    type="text"
                    id="employeePhone"
                    placeholder="+94XXXXXXXXX"
                    value={employeePhone}
                    onChange={(e) => {
                      const formattedNumber = formatPhoneNumber(e.target.value);
                      setEmployeePhone(formattedNumber);
                    }}
                    required
                  />
                  {phoneError && <p className="error-message">{phoneError}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password:</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">
                  Register Employee
                </button>
              </form>
              {message && (
                <p
                  className={`alert ${
                    message.includes("successfully") ? "success" : "error"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          )}

          {activeSection === "employeeList" && (
            <div className="employee-list-container">
              <h2>Employee List</h2>
              {employeeList.length > 0 ? (
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeList.map((employee) => (
                      <tr key={employee.ID}>
                        <td>{employee.ID}</td>
                        <td>{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.phone}</td>
                        <td className="actions-cell">
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsUpdateModalOpen(true);
                            }}
                          >
                            Update
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-state">No employees found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Update Employee</h2>
            <form onSubmit={handleUpdateEmployee}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={selectedEmployee.name}
                  onChange={(e) =>
                    setSelectedEmployee({
                      ...selectedEmployee,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={selectedEmployee.email}
                  onChange={(e) =>
                    setSelectedEmployee({
                      ...selectedEmployee,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="text"
                  value={selectedEmployee.phone || ""}
                  placeholder="+94XXXXXXXXX"
                  onChange={(e) => {
                    const formattedNumber = formatPhoneNumber(e.target.value);
                    setSelectedEmployee({
                      ...selectedEmployee,
                      phone: formattedNumber,
                    });
                  }}
                />
                {phoneError && <p className="error-message">{phoneError}</p>}
              </div>
              <button type="submit" className="submit-btn">
                Update
              </button>
              <button
                className="cancel-btn"
                onClick={() => setIsUpdateModalOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Delete Employee</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedEmployee.name}</strong>?
            </p>
            <button className="delete-btn" onClick={handleDeleteEmployee}>
              Delete
            </button>
            <button
              className="cancel-btn"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AuthenticatedshedOwnerDashboard = withAuth2(ShedOwnerDashboard);
export default AuthenticatedshedOwnerDashboard;
