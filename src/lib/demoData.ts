// Demo data used when the backend is unavailable (hosted/demo environment)

export const demoFacilities = [
  { id: '101', name: 'CSE Lab 1', type: 'Computer Lab', capacity: 40, status: 'Available', equipment: ['30 PCs', 'AC', 'Projector', 'Whiteboard'] },
  { id: '102', name: 'CSE Lab 2', type: 'Computer Lab', capacity: 40, status: 'In Use', equipment: ['30 PCs', 'AC', 'Projector'] },
  { id: '201', name: 'Main Auditorium', type: 'Seminar Hall', capacity: 300, status: 'Available', equipment: ['AC', 'Projector', 'Sound System', 'Podium'] },
  { id: '202', name: 'Seminar Hall A', type: 'Seminar Hall', capacity: 100, status: 'Available', equipment: ['AC', 'Projector', 'Whiteboard'] },
  { id: '301', name: 'Physics Lab', type: 'Electronics Lab', capacity: 30, status: 'Maintenance', equipment: ['Lab Equipment', 'Whiteboard'] },
  { id: '302', name: 'Chemistry Lab', type: 'Electronics Lab', capacity: 30, status: 'Available', equipment: ['Lab Equipment', 'Fume Hood', 'Whiteboard'] },
  { id: '401', name: 'Classroom A', type: 'Classroom', capacity: 60, status: 'Available', equipment: ['AC', 'Projector', 'Whiteboard'] },
  { id: '402', name: 'Classroom B', type: 'Classroom', capacity: 60, status: 'In Use', equipment: ['AC', 'Whiteboard'] },
  { id: '403', name: 'Classroom C', type: 'Classroom', capacity: 60, status: 'Available', equipment: ['AC', 'Projector', 'Whiteboard'] },
];

export const demoAssets = [
  { id: 'AST-1001', name: 'Dell Optiplex 7090', category: 'Computer', location: 'CSE Lab 1', status: 'Active', purchaseDate: 'Jan 15, 2023' },
  { id: 'AST-1002', name: 'HP EliteBook Laptop', category: 'Computer', location: 'CSE Lab 2', status: 'Active', purchaseDate: 'Mar 10, 2023' },
  { id: 'AST-1003', name: 'Epson Projector', category: 'Electronics', location: 'Main Auditorium', status: 'Active', purchaseDate: 'Jun 05, 2022' },
  { id: 'AST-1004', name: 'Sony Projector', category: 'Electronics', location: 'Seminar Hall A', status: 'Maintenance', purchaseDate: 'Aug 20, 2022' },
  { id: 'AST-1005', name: 'Office Chair Set (10)', category: 'Furniture', location: 'Classroom A', status: 'Active', purchaseDate: 'Feb 01, 2021' },
  { id: 'AST-1006', name: 'Smart Board', category: 'Electronics', location: 'CSE Lab 1', status: 'Active', purchaseDate: 'Apr 15, 2023' },
  { id: 'AST-1007', name: 'Lab Workbench Set', category: 'Equipment', location: 'Physics Lab', status: 'Active', purchaseDate: 'Sep 12, 2020' },
  { id: 'AST-1008', name: 'AC Unit (2 Ton)', category: 'Equipment', location: 'Classroom B', status: 'Active', purchaseDate: 'May 22, 2022' },
];

export const demoMaintenance = [
  { id: 'MNT-001', title: 'Projector Lamp Replacement', facility: 'Seminar Hall A', priority: 'High', status: 'In Progress', reportedDate: '2026-05-18', description: 'Projector lamp is flickering and needs replacement.' },
  { id: 'MNT-002', title: 'AC Servicing', facility: 'CSE Lab 2', priority: 'Medium', status: 'Pending', reportedDate: '2026-05-19', description: 'Air conditioner not cooling properly.' },
  { id: 'MNT-003', title: 'Broken Chairs', facility: 'Classroom C', priority: 'Low', status: 'Pending', reportedDate: '2026-05-20', description: '3 chairs are broken and need replacement.' },
  { id: 'MNT-004', title: 'Network Switch Repair', facility: 'CSE Lab 1', priority: 'High', status: 'Completed', reportedDate: '2026-05-15', description: 'Network switch causing connectivity issues.' },
  { id: 'MNT-005', title: 'Whiteboard Replacement', facility: 'Classroom A', priority: 'Low', status: 'Completed', reportedDate: '2026-05-10', description: 'Whiteboard surface damaged beyond cleaning.' },
  { id: 'MNT-006', title: 'Physics Lab Equipment Check', facility: 'Physics Lab', priority: 'High', status: 'In Progress', reportedDate: '2026-05-17', description: 'Annual equipment calibration and safety check.' },
];

export const demoBookings = [
  { id: 'BKG-001', title: 'Data Structures Extra Class', time: '2026-05-21 at 09:00 AM - 11:00 AM', location: 'CSE Lab 1', organizer: 'Dr. Ramesh Kumar', status: 'Approved' },
  { id: 'BKG-002', title: 'Guest Lecture - AI & ML', time: '2026-05-22 at 02:00 PM - 04:00 PM', location: 'Main Auditorium', organizer: 'Prof. Anita Sharma', status: 'Pending' },
  { id: 'BKG-003', title: 'Department Meeting', time: '2026-05-23 at 11:00 AM - 12:00 PM', location: 'Seminar Hall A', organizer: 'HOD - CSE', status: 'Approved' },
  { id: 'BKG-004', title: 'Workshop on IoT', time: '2026-05-24 at 10:00 AM - 01:00 PM', location: 'CSE Lab 2', organizer: 'Dr. Suresh Babu', status: 'Pending' },
  { id: 'BKG-005', title: 'Placement Training Session', time: '2026-05-25 at 09:00 AM - 12:00 PM', location: 'Main Auditorium', organizer: 'Placement Cell', status: 'Approved' },
];

export const demoDashboard = {
  availableClassrooms: 6,
  activeMaintenance: 3,
  totalAssets: 8,
  criticalIssues: 2,
  weeklyUsage: [
    { name: 'Mon', bookings: 4 },
    { name: 'Tue', bookings: 7 },
    { name: 'Wed', bookings: 5 },
    { name: 'Thu', bookings: 8 },
    { name: 'Fri', bookings: 6 },
    { name: 'Sat', bookings: 2 },
    { name: 'Sun', bookings: 1 },
  ],
  recentActivity: [
    { type: 'maintenance', message: 'Projector fixed in Seminar Hall A', time: '10 mins ago' },
    { type: 'booking', message: 'Main Auditorium booked for Guest Lecture', time: '1 hour ago' },
    { type: 'asset', message: 'New AC unit installed in CSE Lab 1', time: '3 hours ago' },
    { type: 'maintenance', message: 'Routine inspection completed in Physics Lab', time: '5 hours ago' },
    { type: 'booking', message: 'Classroom B reserved for Placement Training', time: '1 day ago' },
  ]
};
