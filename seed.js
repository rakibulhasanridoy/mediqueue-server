const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://MediQueue:SE5r1ZvUz1SeW93e@cluser0.8auzyf1.mongodb.net/?appName=Cluser0";

const tutors = [
  {
    title: "Dr. Julian Thorne",
    instructor: "Dr. Julian Thorne",
    category: "Anatomy",
    availableDaysSlot: "Mon - Wed 8:00 AM - 11:00 AM",
    price: "125",
    totalSlot: 5,
    startDate: "2026-05-20",
    institution: "Johns Hopkins Medicine",
    experience: "12+ Years Exp.",
    location: "Baltimore, MD",
    teachingMode: "Both",
    thumbnail: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600",
    rating: 4.9,
    reviewsCount: 240,
    successRate: "98%",
    sessionsCount: "1.2k",
    description: "Specializing in the intersection of traditional surgical techniques and advanced robotic-assisted procedures. Dr. Thorne provides a deep-dive curriculum into complex anatomical structures, designed specifically for senior residents and surgical fellows aiming for mastery in neuro-navigation.",
    ownerEmail: "system@mediqueue.com"
  },
  {
    title: "Dr. Julian Vance",
    instructor: "Dr. Julian Vance",
    category: "Genomics",
    availableDaysSlot: "Sun - Tue 5:00 PM - 8:00 PM",
    price: "180",
    totalSlot: 8,
    startDate: "2026-05-22",
    institution: "Harvard Medical School",
    experience: "12 Years Experience",
    location: "Boston, MA",
    teachingMode: "Online",
    thumbnail: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600",
    rating: 4.9,
    reviewsCount: 240,
    successRate: "97%",
    sessionsCount: "800",
    description: "Pioneering researcher and tutor in high-throughput sequencing technology, precision therapies, and genomic data visualization models for advanced clinical diagnostics.",
    ownerEmail: "system@mediqueue.com"
  },
  {
    title: "Dr. Elena Rodriguez",
    instructor: "Dr. Elena Rodriguez",
    category: "Neurology",
    availableDaysSlot: "Mon - Thu 6:00 PM - 9:00 PM",
    price: "220",
    totalSlot: 3,
    startDate: "2026-05-25",
    institution: "Stanford Medicine",
    experience: "8 Years Experience",
    location: "Stanford, CA",
    teachingMode: "Offline",
    thumbnail: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=600",
    rating: 5.0,
    reviewsCount: 188,
    successRate: "99%",
    sessionsCount: "420",
    description: "Providing rigorous 1-on-1 tutoring on microsurgical techniques, spinal cord injuries, and cortical mapping protocols for advanced medical students.",
    ownerEmail: "system@mediqueue.com"
  },
  {
    title: "Dr. Michael Chen",
    instructor: "Dr. Michael Chen",
    category: "Cardiology",
    availableDaysSlot: "Tue - Thu 9:00 AM - 12:00 PM",
    price: "165",
    totalSlot: 0, // Fully Booked!
    startDate: "2026-05-18",
    institution: "Johns Hopkins University",
    experience: "15 Years Experience",
    location: "Baltimore, MD",
    teachingMode: "Online",
    thumbnail: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600",
    rating: 4.8,
    reviewsCount: 312,
    successRate: "95%",
    sessionsCount: "1.5k",
    description: "Clinical instructor focusing on electrophysiology, hemodynamic monitoring systems, and structural cardiac interventions.",
    ownerEmail: "system@mediqueue.com"
  },
  {
    title: "Dr. Sarah Chen",
    instructor: "Dr. Sarah Chen",
    category: "Oncology",
    availableDaysSlot: "Mon - Wed 2:30 PM - 5:30 PM",
    price: "120",
    totalSlot: 4,
    startDate: "2026-05-24",
    institution: "Johns Hopkins Medicine",
    experience: "10 Years Experience",
    location: "Baltimore, MD",
    teachingMode: "Both",
    thumbnail: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=600",
    rating: 4.9,
    reviewsCount: 154,
    successRate: "98%",
    sessionsCount: "680",
    description: "Expert in functional neuroimaging and complex neurosurgical oncology pathways, offering clinical case discussions for medical licensing boards.",
    ownerEmail: "system@mediqueue.com"
  },
  {
    title: "Prof. Marcus Vane",
    instructor: "Prof. Marcus Vane",
    category: "Cardiology",
    availableDaysSlot: "Wed - Fri 1:00 PM - 4:00 PM",
    price: "180",
    totalSlot: 6,
    startDate: "2026-05-26",
    institution: "Mayo Clinic College",
    experience: "18 Years Experience",
    location: "Rochester, MN",
    teachingMode: "Both",
    thumbnail: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600",
    rating: 4.9,
    reviewsCount: 210,
    successRate: "96%",
    sessionsCount: "1.1k",
    description: "Pioneer in minimally invasive cardiac procedures and structural heart disease tutoring for clinical fellows.",
    ownerEmail: "system@mediqueue.com"
  },
  {
    title: "Prof. Arthur Sterling",
    instructor: "Prof. Arthur Sterling",
    category: "Virology",
    availableDaysSlot: "Tue - Thu 10:00 AM - 1:00 PM",
    price: "160",
    totalSlot: 7,
    startDate: "2026-06-01", // Future Date for Restriction Testing
    institution: "UCSF Medical Center",
    experience: "20 Years Experience",
    location: "San Francisco, CA",
    teachingMode: "Online",
    thumbnail: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600",
    rating: 4.9,
    reviewsCount: 95,
    successRate: "98%",
    sessionsCount: "820",
    description: "Leading researcher in molecular pathology and viral evolution diagnostics, offering comprehensive training in genomic virology.",
    ownerEmail: "system@mediqueue.com"
  },
  {
    title: "Dr. Mia Kowalski",
    instructor: "Dr. Mia Kowalski",
    category: "Pediatrics",
    availableDaysSlot: "Sun - Wed 11:00 AM - 2:00 PM",
    price: "115",
    totalSlot: 2,
    startDate: "2026-05-21",
    institution: "Mass General Brigham",
    experience: "11 Years Experience",
    location: "Boston, MA",
    teachingMode: "Offline",
    thumbnail: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600",
    rating: 4.7,
    reviewsCount: 140,
    successRate: "94%",
    sessionsCount: "510",
    description: "Trauma care specialist with emphasis on fast-paced triage, pediatric emergency response, and neonatal intensive care protocols.",
    ownerEmail: "system@mediqueue.com"
  },
  {
    title: "Dr. Elias Thorne",
    instructor: "Dr. Elias Thorne",
    category: "Neurology",
    availableDaysSlot: "Mon - Wed 9:00 AM - 12:00 PM",
    price: "150",
    totalSlot: 10,
    startDate: "2026-05-19",
    institution: "Johns Hopkins Medicine",
    experience: "14 Years Experience",
    location: "Baltimore, MD",
    teachingMode: "Both",
    thumbnail: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600",
    rating: 4.9,
    reviewsCount: 175,
    successRate: "97%",
    sessionsCount: "920",
    description: "Clinical consultant in genomic medicine, neuro-immunology, and movement disorder tutoring for advanced clinical practitioners.",
    ownerEmail: "system@mediqueue.com"
  },
  {
    title: "Dr. James Miller",
    instructor: "Dr. James Miller",
    category: "Oncology",
    availableDaysSlot: "Tue - Thu 4:00 PM - 7:00 PM",
    price: "240",
    totalSlot: 3,
    startDate: "2026-05-23",
    institution: "Johns Hopkins Medicine",
    experience: "16 Years Experience",
    location: "Baltimore, MD",
    teachingMode: "Both",
    thumbnail: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600",
    rating: 4.8,
    reviewsCount: 112,
    successRate: "98%",
    sessionsCount: "740",
    description: "Senior oncologist specialized in minimally invasive surgical interventions, immuno-oncology, and clinical trial design coaching.",
    ownerEmail: "system@mediqueue.com"
  }
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to seed database!");
    const db = client.db("MediQueue");
    const tutorsCollection = db.collection('tutors');
    
    // Clear old tutors
    await tutorsCollection.deleteMany({});
    console.log("Deleted old tutors placeholder records.");
    
    // Insert new tutors
    const res = await tutorsCollection.insertMany(tutors);
    console.log(`Inserted ${res.insertedCount} premium medical specialist tutors successfully!`);
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.close();
  }
}

seed();
