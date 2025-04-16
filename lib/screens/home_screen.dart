import 'package:flutter/material.dart';
import 'fuel_entry_screen.dart';  // Import your FuelEntryScreen

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fuel Management App'),
        backgroundColor: Colors.green,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Message
            const Text(
              'Welcome to the Fuel Quota Management App',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Status Information (e.g., total fuel entered)
            const Text(
              'Total Fuel Entered: 150 liters', // Placeholder, this could come from a database
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 32),

            // Button to navigate to Fuel Entry Screen
            Center(
              child: ElevatedButton(
                onPressed: () {
                  // Navigate to Fuel Entry Screen
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const FuelEntryScreen()),
                  );
                },
                child: const Text('Enter New Fuel Data'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
