-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 08, 2025 at 08:54 PM
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
-- Table structure for table `fuel_quotas`
--

CREATE TABLE `fuel_quotas` (
  `id` int(11) NOT NULL,
  `vehicle_owner_id` int(11) NOT NULL,
  `vehicle_type_id` int(11) NOT NULL,
  `remaining_quota` decimal(5,2) NOT NULL,
  `week_start_date` date NOT NULL,
  `week_end_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fuel_quotas`
--

INSERT INTO `fuel_quotas` (`id`, `vehicle_owner_id`, `vehicle_type_id`, `remaining_quota`, `week_start_date`, `week_end_date`) VALUES
(11, 3, 1, 5.00, '2025-04-27', '2025-05-03');

-- --------------------------------------------------------

--
-- Table structure for table `fuel_stations`
--

CREATE TABLE `fuel_stations` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `nic` varchar(12) NOT NULL,
  `contact_number1` varchar(15) DEFAULT NULL,
  `contact_number2` varchar(15) DEFAULT NULL,
  `email1` varchar(100) DEFAULT NULL,
  `email2` varchar(100) DEFAULT NULL,
  `fuel_station_name` varchar(100) NOT NULL,
  `station_registration_number` varchar(50) NOT NULL,
  `location` varchar(200) NOT NULL,
  `registered_date` date NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fuel_stations`
--

INSERT INTO `fuel_stations` (`id`, `full_name`, `nic`, `contact_number1`, `contact_number2`, `email1`, `email2`, `fuel_station_name`, `station_registration_number`, `location`, `registered_date`, `password`) VALUES
(1, 'Venuja Prasa', '198523456789', '0771234567', '0771234565', 'ruwan.jaya@cityfuel.lk', 'venujaeducation@gmail.com', 'City Fuel Centre - Colombo', 'FSREG001', 'Colombo 07, Western Province', '2025-05-01', '$2b$12$8QSFgbg/.CMogbyfnmMWXeHjb/g0iUHgulKH1mWCA2abQ3L20k/Yy');

-- --------------------------------------------------------

--
-- Table structure for table `vehicleowner`
--

CREATE TABLE `vehicleowner` (
  `id` int(11) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `NIC` varchar(20) NOT NULL,
  `vehicleType` int(11) NOT NULL,
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
(3, 'Venuja', 'Prasanjith', '987654321V', 1, 'XYZ-5678', 'ENG987654321', '$2b$12$cdwC0CHBQNtFwUNjShnWoe3nc.5sBqU0elgYwiUWQ/EEvjGAspIzy', 'a59ab36f7b60051d0c58e63db77e3523b4fd2f75b4d3ed8f660036ff7e969a91', '2025-05-01 03:03:39', '2025-05-01 03:03:39');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_types`
--

CREATE TABLE `vehicle_types` (
  `id` int(11) NOT NULL,
  `type_name` varchar(50) NOT NULL,
  `weekly_quota` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicle_types`
--

INSERT INTO `vehicle_types` (`id`, `type_name`, `weekly_quota`) VALUES
(1, 'Motorcycle', 10.00),
(2, 'Car', 20.00),
(3, 'Van', 25.00),
(4, 'SUV', 22.00),
(5, 'Lorry', 30.00),
(6, 'Bus', 50.00),
(7, 'Tractor', 40.00),
(8, 'Three Wheeler', 8.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `fuel_quotas`
--
ALTER TABLE `fuel_quotas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_vehicle_week` (`vehicle_owner_id`,`week_start_date`),
  ADD KEY `idx_vehicle_type` (`vehicle_type_id`);

--
-- Indexes for table `fuel_stations`
--
ALTER TABLE `fuel_stations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nic` (`nic`),
  ADD UNIQUE KEY `station_registration_number` (`station_registration_number`);

--
-- Indexes for table `vehicleowner`
--
ALTER TABLE `vehicleowner`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `NIC` (`NIC`),
  ADD UNIQUE KEY `vehicleNumber` (`vehicleNumber`),
  ADD UNIQUE KEY `engineNumber` (`engineNumber`),
  ADD KEY `vehicleType` (`vehicleType`);

--
-- Indexes for table `vehicle_types`
--
ALTER TABLE `vehicle_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `fuel_quotas`
--
ALTER TABLE `fuel_quotas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `fuel_stations`
--
ALTER TABLE `fuel_stations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vehicleowner`
--
ALTER TABLE `vehicleowner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vehicle_types`
--
ALTER TABLE `vehicle_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `fuel_quotas`
--
ALTER TABLE `fuel_quotas`
  ADD CONSTRAINT `fuel_quotas_ibfk_1` FOREIGN KEY (`vehicle_owner_id`) REFERENCES `vehicleowner` (`id`),
  ADD CONSTRAINT `fuel_quotas_ibfk_2` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types` (`id`);

--
-- Constraints for table `vehicleowner`
--
ALTER TABLE `vehicleowner`
  ADD CONSTRAINT `vehicleowner_ibfk_1` FOREIGN KEY (`vehicleType`) REFERENCES `vehicle_types` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
