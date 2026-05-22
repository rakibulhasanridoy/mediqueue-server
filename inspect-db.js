const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://MediQueue:SE5r1ZvUz1SeW93e@cluser0.8auzyf1.mongodb.net/?appName=Cluser0";

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("MediQueue");
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Inspect tutors
    const tutorsCollection = db.collection('tutors');
    const tutors = await tutorsCollection.find({}).limit(3).toArray();
    console.log("Sample Tutors:", JSON.stringify(tutors, null, 2));

    // Inspect enrollments
    const enrollmentsCollection = db.collection('enrollments');
    const enrollmentsCount = await enrollmentsCollection.countDocuments();
    console.log("Enrollments Count:", enrollmentsCount);
    if (enrollmentsCount > 0) {
      const enrollments = await enrollmentsCollection.find({}).limit(3).toArray();
      console.log("Sample Enrollments:", JSON.stringify(enrollments, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
