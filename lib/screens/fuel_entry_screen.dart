import 'package:flutter/material.dart';

class FuelEntryScreen extends StatefulWidget {
  const FuelEntryScreen({super.key});

  @override
  _FuelEntryScreenState createState() => _FuelEntryScreenState();
}

class _FuelEntryScreenState extends State<FuelEntryScreen> {
  final _fuelAmountController = TextEditingController();
  final _dateController = TextEditingController();
  String _fuelType = 'Petrol';  // Default fuel type

  // Function to handle fuel entry submission
  void _submitFuelEntry() {
    // Here you can handle the submission, like saving the data to a database or showing a confirmation dialog.
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Fuel Entry Submitted'),
          content: Text('Amount: ${_fuelAmountController.text} liters\nDate: ${_dateController.text}\nFuel Type: $_fuelType'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('OK'),
            ),
          ],
        );
      },
    );
  }

  // Function to show date picker
  Future<void> _selectDate(BuildContext context) async {
    final DateTime? selectedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );
    if (selectedDate != null && selectedDate != DateTime.now()) {
      setState(() {
        _dateController.text = selectedDate.toLocal().toString().split(' ')[0];  // Format the date to yyyy-mm-dd
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fuel Entry'),
        backgroundColor: Colors.green,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Fuel Amount Input
            TextField(
              controller: _fuelAmountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Fuel Amount (in liters)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Fuel Type Dropdown
            DropdownButton<String>(
              value: _fuelType,
              onChanged: (String? newValue) {
                setState(() {
                  _fuelType = newValue!;
                });
              },
              items: <String>['Petrol', 'Diesel', 'Electric']
                  .map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Date Picker
            TextField(
              controller: _dateController,
              decoration: InputDecoration(
                labelText: 'Date of Fuel Entry',
                border: OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.calendar_today),
                  onPressed: () => _selectDate(context),
                ),
              ),
              readOnly: true, // Makes the TextField non-editable directly
            ),
            const SizedBox(height: 32),

            // Submit Button
            Center(
  child: ElevatedButton(
    onPressed: _submitFuelEntry,
    child: const Text('Submit Fuel Entry'),
    style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
  ),
)
,
          ],
        ),
      ),
    );
  }
}
