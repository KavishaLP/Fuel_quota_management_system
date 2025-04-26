-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 26, 2025 at 02:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vehicleregisterdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `vehicleowner`
--

CREATE TABLE `vehicleowner` (
  `id` int(11) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `NIC` varchar(20) NOT NULL,
  `vehicleType` varchar(50) NOT NULL,
  `vehicleNumber` varchar(20) NOT NULL,
  `engineNumber` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `uniqueToken` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicleowner`
--

INSERT INTO `vehicleowner` (`id`, `firstName`, `lastName`, `NIC`, `vehicleType`, `vehicleNumber`, `engineNumber`, `password`, `uniqueToken`, `createdAt`, `updatedAt`) VALUES
(37, 'Jane ', 'Smith', '987654321V', 'Car', 'XYZ-5678', 'ENG987654321', '$2b$12$UIRz3NpVz98dusdhU6lI7eRs5mh5quWhGtqyf9XAA1Cp.LIQeu1xG', 'ddb205d505bf348e782db503d2033f1b9871b90b590ea62351d1e1b69b3df4e2', '2025-04-26 07:22:00', '2025-04-26 07:22:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `vehicleowner`
--
ALTER TABLE `vehicleowner`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `NIC` (`NIC`),
  ADD UNIQUE KEY `vehicleNumber` (`vehicleNumber`),
  ADD UNIQUE KEY `engineNumber` (`engineNumber`),
  ADD KEY `idx_vehicle_number` (`vehicleNumber`),
  ADD KEY `idx_nic` (`NIC`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `vehicleowner`
--
ALTER TABLE `vehicleowner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
