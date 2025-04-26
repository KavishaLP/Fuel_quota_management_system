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
-- Database: `motortrafficdepdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `registered_vehicles`
--

CREATE TABLE `registered_vehicles` (
  `id` int(11) NOT NULL,
  `vehicleNumber` varchar(20) NOT NULL,
  `engineNumber` varchar(50) NOT NULL,
  `make` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `year` int(11) NOT NULL,
  `ownerName` varchar(100) NOT NULL,
  `ownerNIC` varchar(20) NOT NULL,
  `registrationDate` date NOT NULL,
  `lastRenewalDate` date DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `registered_vehicles`
--

INSERT INTO `registered_vehicles` (`id`, `vehicleNumber`, `engineNumber`, `make`, `model`, `year`, `ownerName`, `ownerNIC`, `registrationDate`, `lastRenewalDate`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'ABC-1234', 'ENG123456789', 'Toyota', 'Corolla', 2020, 'John Doe', '123456789V', '2020-01-15', '2023-01-15', 1, '2025-04-25 20:50:37', '2025-04-25 20:50:37'),
(2, 'XYZ-5678', 'ENG987654321', 'Honda', 'Civic', 2019, 'Jane Smith', '987654321V', '2019-03-20', '2023-03-20', 1, '2025-04-25 20:50:37', '2025-04-25 20:50:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `registered_vehicles`
--
ALTER TABLE `registered_vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicleNumber` (`vehicleNumber`),
  ADD UNIQUE KEY `engineNumber` (`engineNumber`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `registered_vehicles`
--
ALTER TABLE `registered_vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
