const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('../models/User');
const Organization = require('../models/Organization');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const CarbonRecord = require('../models/CarbonRecord');
const EnergyBill = require('../models/EnergyBill');
const Policy = require('../models/Policy');
const CSRActivity = require('../models/CSRActivity');
const Reward = require('../models/Reward');
const Badge = require('../models/Badge');
const Challenge = require('../models/Challenge');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const UploadedDocument = require('../models/UploadedDocument');
const AIRecommendation = require('../models/AIRecommendation');
const ConfidenceScore = require('../models/ConfidenceScore');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere_ai');
    console.log('Seeding Database... Clean up existing collections');

    // Clean up
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await CarbonRecord.deleteMany({});
    await EnergyBill.deleteMany({});
    await Policy.deleteMany({});
    await CSRActivity.deleteMany({});
    await Reward.deleteMany({});
    await Badge.deleteMany({});
    await Challenge.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});
    await UploadedDocument.deleteMany({});
    await AIRecommendation.deleteMany({});
    await ConfidenceScore.deleteMany({});

    // 1. Create Organization
    const organization = await Organization.create({
      name: 'EcoSphere Corp',
      industry: 'Software & Technology',
      location: 'Silicon Valley, California',
      esgTarget: 'Net Zero Carbon footprint by 2030',
      carbonGoal: 500,
      financialYear: 'FY2026'
    });

    // 2. Create Departments
    const deptExec = await Department.create({
      name: 'Executive Suite',
      code: 'EXEC',
      organization: organization._id,
      description: 'Corporate directors'
    });

    const deptEng = await Department.create({
      name: 'Engineering & R&D',
      code: 'ENG',
      organization: organization._id,
      description: 'Main product developments'
    });

    const deptFac = await Department.create({
      name: 'Facilities & Logistics',
      code: 'FAC',
      organization: organization._id,
      description: 'Building and operations management'
    });

    // 3. Create Badges
    const badgeGreenHero = await Badge.create({
      organization: organization._id,
      name: 'Green Hero',
      description: 'Achieved first emissions reductions log',
      criteria: 'Log at least 1 verified carbon record'
    });

    const badgePowerSaver = await Badge.create({
      organization: organization._id,
      name: 'Power Saver',
      description: 'Reduced electricity waste',
      criteria: 'Log electricity consumption under 100 kWh'
    });

    // 4. Create Users (Admin, Managers, Employees)
    const adminUser = await User.create({
      email: 'admin@ecosphere.ai',
      password: 'password123',
      role: 'Admin',
      organization: organization._id
    });

    const managerUser = await User.create({
      email: 'manager@ecosphere.ai',
      password: 'password123',
      role: 'Manager',
      organization: organization._id
    });

    const employeeUser1 = await User.create({
      email: 'shiva@ecosphere.ai',
      password: 'password123',
      role: 'Employee',
      organization: organization._id
    });

    const employeeUser2 = await User.create({
      email: 'mahek@ecosphere.ai',
      password: 'password123',
      role: 'Employee',
      organization: organization._id
    });

    // 5. Create Employees Profiles
    const adminEmployee = await Employee.create({
      user: adminUser._id,
      name: 'Elena Rostova',
      employeeId: 'EMP-001',
      department: deptExec._id,
      organization: organization._id,
      points: 150,
      badges: [badgeGreenHero._id]
    });
    deptExec.manager = adminEmployee._id;
    await deptExec.save();

    const managerEmployee = await Employee.create({
      user: managerUser._id,
      name: 'Carlos Santana',
      employeeId: 'EMP-002',
      department: deptEng._id,
      organization: organization._id,
      points: 300,
      badges: [badgeGreenHero._id, badgePowerSaver._id]
    });
    deptEng.manager = managerEmployee._id;
    await deptEng.save();

    const emp1 = await Employee.create({
      user: employeeUser1._id,
      name: 'Shiva Ulligepally',
      employeeId: 'EMP-003',
      department: deptEng._id,
      organization: organization._id,
      points: 450,
      badges: [badgeGreenHero._id, badgePowerSaver._id]
    });

    const emp2 = await Employee.create({
      user: employeeUser2._id,
      name: 'Mahek Khan',
      employeeId: 'EMP-004',
      department: deptFac._id,
      organization: organization._id,
      points: 120,
      badges: [badgeGreenHero._id]
    });
    deptFac.manager = emp2._id;
    await deptFac.save();

    // 6. Create Uploaded Document mock for proof
    const docProof = await UploadedDocument.create({
      name: 'january_utility_bill.pdf',
      url: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
      fileType: 'application/pdf',
      owner: managerUser._id,
      organization: organization._id,
      verificationStatus: 'Verified'
    });

    // 7. Create Carbon Records (Mock history)
    const carbon1 = await CarbonRecord.create({
      department: deptEng._id,
      organization: organization._id,
      recordedBy: managerEmployee._id,
      scope: 'Scope 2',
      activityType: 'Electricity',
      value: 12.5,
      date: new Date('2026-05-10'),
      evidenceDocument: docProof._id
    });

    const carbon2 = await CarbonRecord.create({
      department: deptFac._id,
      organization: organization._id,
      recordedBy: emp2._id,
      scope: 'Scope 1',
      activityType: 'Fuel Combustion',
      value: 45.2,
      date: new Date('2026-06-15')
    });

    // 8. Confidence Score calculations
    await ConfidenceScore.create({
      organization: organization._id,
      targetModel: 'CarbonRecord',
      targetId: carbon1._id,
      score: 95,
      factors: [
        { factorName: 'Evidence Uploaded', status: 'Pass', weight: 40 },
        { factorName: 'Approved Department Log', status: 'Pass', weight: 30 }
      ],
      verifiedByAI: true
    });

    // 9. AI recommendations
    await AIRecommendation.create({
      organization: organization._id,
      recommendationType: 'Energy Efficiency',
      title: 'Upgrade Server Room cooling fans',
      description: 'Replacing older server fans with newer variable speed units will reduce Scope 2 electricity load by 15%.',
      potentialSavingsCo2e: 4.8,
      potentialFinancialSavings: 1200,
      confidenceScore: 92
    });

    // 10. CSR Activities
    await CSRActivity.create({
      organization: organization._id,
      title: 'Annual Tree Planting Drive 2026',
      description: 'Collaborated tree planting drive in local neighborhood park.',
      date: new Date('2026-07-20'),
      budget: 5000,
      participants: [emp1._id, emp2._id]
    });

    // 11. Rewards Catalog
    await Reward.create({
      organization: organization._id,
      title: 'Bamboo Eco Cup',
      description: 'Reusable organic bamboo fiber coffee mug.',
      pointsRequired: 100,
      stock: 50
    });

    await Reward.create({
      organization: organization._id,
      title: 'Plant a tree in your name',
      description: 'A tree is planted in the Amazon rainforest with certificate sent to your email.',
      pointsRequired: 200,
      stock: 999
    });

    // 12. Challenges
    await Challenge.create({
      organization: organization._id,
      title: 'Zero Waste Week',
      description: 'Minimize plastic and food waste logged in the building.',
      startDate: new Date('2026-07-10'),
      endDate: new Date('2026-07-17'),
      rewardPoints: 150,
      status: 'Active'
    });

    console.log('Seeding Database Completed Successfully! ✅');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database: ', error);
    process.exit(1);
  }
};

seedDatabase();
