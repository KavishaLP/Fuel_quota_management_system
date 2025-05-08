-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 08, 2025 at 06:03 PM
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
-- Table structure for table `fuel_sheds`
--

CREATE TABLE `fuel_sheds` (
  `id` int(11) NOT NULL,
  `owner_name` varchar(100) NOT NULL,
  `nic` varchar(12) NOT NULL,
  `fuel_station_name` varchar(100) NOT NULL,
  `station_registration_number` varchar(50) NOT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `location` varchar(200) NOT NULL,
  `registered_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fuel_sheds`
--

INSERT INTO `fuel_sheds` (`id`, `owner_name`, `nic`, `fuel_station_name`, `station_registration_number`, `contact_number`, `email`, `location`, `registered_date`) VALUES
(1, 'Ruwan Jayasuriya', '198523456789', 'City Fuel Centre - Colombo', 'FSREG001', '0771234567', 'ruwan.jaya@cityfuel.lk', 'Colombo 07, Western Province', '2021-05-12'),
(2, 'Anura Wijesinghe', '197812345678', 'Green Lanka Filling Station', 'FSREG002', '0719876543', 'anura@greenlanka.lk', 'Gampaha, Western Province', '2020-10-25'),
(3, 'Nirosha Perera', '198945672345', 'Kandy Fuel Mart', 'FSREG003', '0784561230', 'nirosha@kandyfuel.lk', 'Kandy, Central Province', '2022-01-08'),
(4, 'Sanjeewa Senanayake', '196734567890', 'Southern Energy Fuel Station', 'FSREG004', '0767894321', 'sanjeewa@southernfuel.lk', 'Matara, Southern Province', '2019-12-14'),
(5, 'Thilina Abeywickrama', '199034567321', 'North Lanka Fuel Depot', 'FSREG005', '0756547890', 'thilina@northlanka.lk', 'Jaffna, Northern Province', '2021-09-30');

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
-- Indexes for table `fuel_sheds`
--
ALTER TABLE `fuel_sheds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nic` (`nic`),
  ADD UNIQUE KEY `station_registration_number` (`station_registration_number`);

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
-- AUTO_INCREMENT for table `fuel_sheds`
--
ALTER TABLE `fuel_sheds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `registered_vehicles`
--
ALTER TABLE `registered_vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
