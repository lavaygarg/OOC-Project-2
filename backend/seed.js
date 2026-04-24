require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('./models/Staff');
const Volunteer = require('./models/Volunteer');
const Donation = require('./models/Donation');
const Disbursement = require('./models/Disbursement');
const Event = require('./models/Event');
const Message = require('./models/Message');
const Institution = require('./models/Institution');

const MONGODB_URI = process.env.MONGODB_URI;

// Default credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hopefoundation.org';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const STAFF_EMAIL = process.env.STAFF_EMAIL || 'staff@hopefoundation.org';
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || 'Staff@123';
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || 'manager@hopefoundation.org';
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || 'Manager@123';
const HR_EMAIL = process.env.HR_EMAIL || 'hr@hopefoundation.org';
const HR_PASSWORD = process.env.HR_PASSWORD || 'Human@123';

const ensureStaffAccount = async ({ name, email, password, role, department, label }) => {
    const existingStaff = await Staff.findOne({ email }).select('+password');

    if (!existingStaff) {
        await Staff.create({
            name,
            email,
            password,
            role,
            department,
            status: 'Active'
        });
        console.log(`👤 Created ${label} user`);
        console.log(`   Email: ${email}`);
        console.log('   Password: [Set in environment variables]');
        return;
    }

    let updated = false;

    const hasPassword = typeof existingStaff.password === 'string' && existingStaff.password.length > 0;
    const passwordMatches = hasPassword ? await existingStaff.comparePassword(password) : false;
    if (!passwordMatches) {
        existingStaff.password = password;
        updated = true;
    }

    if (existingStaff.name !== name) {
        existingStaff.name = name;
        updated = true;
    }

    if (existingStaff.role !== role) {
        existingStaff.role = role;
        updated = true;
    }

    if (existingStaff.department !== department) {
        existingStaff.department = department;
        updated = true;
    }

    if (existingStaff.status !== 'Active') {
        existingStaff.status = 'Active';
        updated = true;
    }

    if (updated) {
        await existingStaff.save();
        console.log(`🔄 Updated ${label} user from environment variables`);
        console.log(`   Email: ${email}`);
    } else {
        console.log(`👤 ${label} user already exists`);
    }
};

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI, { 
            dbName: 'hope-foundation',
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await Promise.all([
        //     Staff.deleteMany({}),
        //     Volunteer.deleteMany({}),
        //     Donation.deleteMany({}),
        //     Disbursement.deleteMany({}),
        //     Event.deleteMany({}),
        //     Message.deleteMany({}),
        //     Institution.deleteMany({})
        // ]);
        // console.log('🗑️  Cleared existing data');

        // Ensure default staff accounts exist and are synced with environment variables
        await ensureStaffAccount({
            name: 'Admin User',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
            department: 'Administration',
            label: 'admin'
        });

        await ensureStaffAccount({
            name: 'Staff User',
            email: STAFF_EMAIL,
            password: STAFF_PASSWORD,
            role: 'staff',
            department: 'Operations',
            label: 'staff'
        });

        await ensureStaffAccount({
            name: 'Programs Manager',
            email: MANAGER_EMAIL,
            password: MANAGER_PASSWORD,
            role: 'manager',
            department: 'Programs',
            label: 'manager'
        });

        await ensureStaffAccount({
            name: 'HR Coordinator',
            email: HR_EMAIL,
            password: HR_PASSWORD,
            role: 'staff',
            department: 'Human Resources',
            label: 'hr staff'
        });

        // Seed sample volunteers
        const volunteerCount = await Volunteer.countDocuments();
        if (volunteerCount === 0) {
            await Volunteer.insertMany([
                { name: 'Priya Patel', email: 'priya@example.com', phone: '9876543210', interest: 'Teaching', status: 'Approved' },
                { name: 'John Doe', email: 'john@example.com', phone: '9876543211', interest: 'Fundraising', status: 'Pending' },
                { name: 'Anita Singh', email: 'anita@example.com', phone: '9876543212', interest: 'Healthcare', status: 'Approved' }
            ]);
            console.log('🙋 Added sample volunteers');
        }

        // Seed sample donations
        const donationCount = await Donation.countDocuments();
        if (donationCount === 0) {
            await Donation.insertMany([
                { donorName: 'Rohan Sharma', amount: 5000, method: 'UPI (Razorpay)', paymentId: 'pay_test001', orderId: 'order_test001', status: 'Completed' },
                { donorName: 'Alice Smith', amount: 12000, method: 'Card (Razorpay)', paymentId: 'pay_test002', orderId: 'order_test002', status: 'Completed' },
                { donorName: 'Tech Corp Inc.', amount: 50000, method: 'Bank Transfer', status: 'Completed' },
                { donorName: 'Priya Verma', amount: 2500, method: 'UPI (Razorpay)', paymentId: 'pay_test003', orderId: 'order_test003', status: 'Completed' },
                { donorName: 'Rajesh Kumar', amount: 8000, method: 'Card (Razorpay)', paymentId: 'pay_test004', orderId: 'order_test004', status: 'Completed' }
            ]);
            console.log('💰 Added sample donations');
        }

        // Seed sample disbursements
        const disbursementCount = await Disbursement.countDocuments();
        if (disbursementCount === 0) {
            await Disbursement.insertMany([
                { recipient: 'Sunrise Public School', amount: 15000, category: 'Education', description: 'Monthly scholarship disbursement', status: 'Disbursed' },
                { recipient: 'Seva Nutrition Center', amount: 8000, category: 'Nutrition', description: 'Weekly meal program funding', status: 'Disbursed' },
                { recipient: 'Asha Health Clinic', amount: 5000, category: 'Healthcare', description: 'Medical supplies for health camp', status: 'Disbursed' }
            ]);
            console.log('📤 Added sample disbursements');
        }

        // Seed sample events
        const eventCount = await Event.countDocuments();
        if (eventCount === 0) {
            await Event.insertMany([
                { title: 'Annual Charity Gala', date: new Date('2026-03-25'), description: 'Join us for an evening of giving and celebration.', location: 'Grand Hotel, Mumbai', status: 'Upcoming' },
                { title: 'Food Drive', date: new Date('2026-02-10'), description: 'Distributing meals in local communities.', location: 'Community Center, Delhi', status: 'Upcoming' },
                { title: 'Donation Drive', date: new Date('2026-02-15'), description: 'Collecting funds and supplies for childrens education.', location: 'City Mall, Bangalore', status: 'Upcoming' },
                { title: 'Free Education Camp', date: new Date('2026-03-20'), description: 'Enrollment drive with books, uniforms, and tutoring support.', location: 'Public School, Ahmedabad', status: 'Upcoming' }
            ]);
            console.log('📅 Added sample events');
        }

        // Seed sample institutions
        const institutionCount = await Institution.countDocuments();
        if (institutionCount === 0) {
            await Institution.insertMany([
                { name: 'Sunrise Public School', city: 'Delhi', sector: 'Education', allocation: 35, impact: 'Scholarships and learning kits for 120 children.', status: 'Active' },
                { name: 'Seva Nutrition Center', city: 'Mumbai', sector: 'Nutrition', allocation: 25, impact: 'Daily nutritious meals for 300 children.', status: 'Active' },
                { name: 'Asha Health Clinic', city: 'Bangalore', sector: 'Healthcare', allocation: 20, impact: 'Monthly health camps and immunizations.', status: 'Active' },
                { name: 'Nirmal Shelter Home', city: 'Kolkata', sector: 'Shelter', allocation: 20, impact: 'Temporary shelter and essentials for families.', status: 'Active' }
            ]);
            console.log('🏢 Added sample institutions');
        }

        // Seed sample messages
        const messageCount = await Message.countDocuments();
        if (messageCount === 0) {
            await Message.insertMany([
                { name: 'Neha Kapoor', email: 'neha@example.com', subject: 'Partnership Inquiry', message: 'Interested in partnering for a nutrition drive.', status: 'Unread' },
                { name: 'Arjun Singh', email: 'arjun@example.com', subject: 'Sponsorship', message: 'Would like to sponsor learning kits this quarter.', status: 'Read' }
            ]);
            console.log('📧 Added sample messages');
        }

        console.log('\n✅ Database seeding completed!');
        console.log('\n📋 Default Login Credentials:');
        console.log(`   Admin: ${ADMIN_EMAIL} / [Set in environment variables]`);
        console.log(`   Staff: ${STAFF_EMAIL} / [Set in environment variables]`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
