const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data using raw SQL query
    await prisma.$executeRaw`DELETE FROM "CallerDatabase"`;
    
    // Add sample caller data
    const callers = [
      {
        name: 'Mickey Mouse',
        phoneNumber: '555444',
        licensePlate: 'LA-555-Mick',
        type: 'personal',
        spamLikelihood: 'low',
        location: 'Los Angeles, CA',
        carrier: 'Disney Mobile'
      },
      {
        name: 'Tom Jones',
        phoneNumber: '555666',
        licensePlate: 'NY-666-Tom',
        type: 'personal',
        spamLikelihood: 'low',
        location: 'New York, NY',
        carrier: 'AT&T'
      },
      {
        name: 'Telemarketing Inc',
        phoneNumber: '555777',
        licensePlate: null,
        type: 'business',
        spamLikelihood: 'high',
        location: 'Phoenix, AZ',
        carrier: 'T-Mobile'
      },
      {
        name: 'Jane Smith',
        phoneNumber: '555888',
        licensePlate: 'TX-888-Jane',
        type: 'personal',
        spamLikelihood: 'low',
        location: 'Dallas, TX',
        carrier: 'Verizon'
      },
      {
        name: 'Unknown Caller',
        phoneNumber: '555999',
        licensePlate: null,
        type: 'unknown',
        spamLikelihood: 'medium',
        location: 'Unknown',
        carrier: 'Unknown'
      }
    ];
    
    for (const caller of callers) {
      await prisma.$executeRaw`
        INSERT INTO "CallerDatabase" (
          "name", 
          "phoneNumber", 
          "licensePlate", 
          "type", 
          "spamLikelihood", 
          "location", 
          "carrier", 
          "createdAt", 
          "updatedAt"
        ) VALUES (
          ${caller.name}, 
          ${caller.phoneNumber}, 
          ${caller.licensePlate}, 
          ${caller.type}, 
          ${caller.spamLikelihood}, 
          ${caller.location}, 
          ${caller.carrier}, 
          ${new Date()}, 
          ${new Date()}
        )
      `;
    }
    
    console.log('Database seeded with sample caller data!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
