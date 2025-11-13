/**
 * Seed Data Script
 * Tạo dữ liệu mẫu cho database: Admin, Providers, Customers và Courses
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models in correct order - Lesson must be imported before models that reference it
const User = require('./models/userModel');
const Lesson = require('./models/lessonModel'); // Import Lesson first
const Course = require('./models/courseModel'); // Then Course (which references Lesson)
const Enrollment = require('./models/enrollmentModel'); // Then Enrollment (which also references Lesson)

// Verify models are registered
console.log('📦 Registered Models:', mongoose.modelNames());

// Double-check Lesson model exists
if (!mongoose.models.Lesson) {
  console.error('❌ Lesson model not found! Trying to re-register...');
  // Force re-register if not found
  require('./models/lessonModel');
}

console.log('✅ Lesson model status:', mongoose.models.Lesson ? 'OK' : 'MISSING');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Sample Users Data
const users = [
  {
    fullName: 'Admin System',
    email: 'admin@edupress.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+System&background=3498db&color=fff',
  },
  {
    fullName: 'Le Quang Huy',
    email: 'provider1@edupress.com',
    password: 'provider123',
    role: 'provider',
    status: 'active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=27ae60&color=fff',
  },
  {
    fullName: 'Tran Thi Binh',
    email: 'provider2@edupress.com',
    password: 'provider123',
    role: 'provider',
    status: 'active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Tran+Thi+Binh&background=e74c3c&color=fff',
  },
  {
    fullName: 'Le Van Cuong',
    email: 'customer1@edupress.com',
    password: 'customer123',
    role: 'customer',
    status: 'active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Le+Van+Cuong&background=9b59b6&color=fff',
  },
  {
    fullName: 'Pham Thi Dung',
    email: 'customer2@edupress.com',
    password: 'customer123',
    role: 'customer',
    status: 'active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Pham+Thi+Dung&background=f39c12&color=fff',
  },
  {
    fullName: 'Hoang Van En',
    email: 'customer3@edupress.com',
    password: 'customer123',
    role: 'customer',
    status: 'pending_provider',
    avatarUrl: 'https://ui-avatars.com/api/?name=Hoang+Van+En&background=16a085&color=fff',
  },
];

// Sample Courses Data (sẽ gán provider sau khi tạo users)
const coursesData = [
  {
    title: 'React - Xây dựng ứng dụng Web hiện đại',
    description: 'Học React từ cơ bản đến nâng cao. Xây dựng các ứng dụng web SPA với React, React Router, Hooks và Context API. Phù hợp cho người mới bắt đầu.',
    price: 499000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    category: 'Web Development',
    status: 'approved',
  },
  {
    title: 'Node.js & Express - Backend Development',
    description: 'Khóa học toàn diện về Node.js và Express.js. Xây dựng RESTful API, xác thực JWT, kết nối MongoDB. Thực hành với các dự án thực tế.',
    price: 599000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    category: 'Web Development',
    status: 'approved',
  },
  {
    title: 'MongoDB - Database NoSQL từ A-Z',
    description: 'Làm chủ MongoDB từ cơ bản đến nâng cao. Học về CRUD operations, aggregation, indexing, và tối ưu hóa performance.',
    price: 399000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    category: 'Data Science',
    status: 'approved',
  },
  {
    title: 'Python cho Data Science và Machine Learning',
    description: 'Khóa học Python tập trung vào Data Science. Học Pandas, NumPy, Matplotlib, Scikit-learn và xây dựng mô hình Machine Learning.',
    price: 799000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    category: 'Data Science',
    status: 'approved',
  },
  {
    title: 'UI/UX Design - Thiết kế giao diện chuyên nghiệp',
    description: 'Học thiết kế UI/UX từ cơ bản. Sử dụng Figma để tạo wireframe, prototype. Hiểu về user research và design thinking.',
    price: 449000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    category: 'Design',
    status: 'approved',
  },
  {
    title: 'Flutter - Lập trình Mobile đa nền tảng',
    description: 'Xây dựng ứng dụng mobile cho iOS và Android với Flutter. Học Dart, widgets, state management và deployment.',
    price: 699000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    category: 'Mobile Development',
    status: 'approved',
  },
  {
    title: 'Digital Marketing - Chiến lược Marketing Online',
    description: 'Khóa học Marketing toàn diện: SEO, SEM, Social Media Marketing, Email Marketing, Content Marketing và Analytics.',
    price: 549000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    category: 'Marketing',
    status: 'pending',
  },
  {
    title: 'AWS Cloud Computing - Từ cơ bản đến nâng cao',
    description: 'Học Amazon Web Services: EC2, S3, Lambda, RDS, CloudFormation. Chuẩn bị cho chứng chỉ AWS Solutions Architect.',
    price: 899000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    category: 'Web Development',
    status: 'pending',
  },
];

// Sample Lessons Data
const lessonsData = [
  // Lessons cho course React
  {
    courseIndex: 0,
    lessons: [
      { title: 'Giới thiệu về React và JSX', videoUrl: 'https://youtube.com/watch?v=sample1', duration: 45 },
      { title: 'Components và Props', videoUrl: 'https://youtube.com/watch?v=sample2', duration: 60 },
      { title: 'State và Lifecycle', videoUrl: 'https://youtube.com/watch?v=sample3', duration: 55 },
      { title: 'React Hooks - useState và useEffect', videoUrl: 'https://youtube.com/watch?v=sample4', duration: 70 },
      { title: 'Context API và State Management', videoUrl: 'https://youtube.com/watch?v=sample5', duration: 65 },
    ],
  },
  // Lessons cho course Node.js
  {
    courseIndex: 1,
    lessons: [
      { title: 'Cài đặt Node.js và NPM', videoUrl: 'https://youtube.com/watch?v=sample6', duration: 30 },
      { title: 'Express.js Framework cơ bản', videoUrl: 'https://youtube.com/watch?v=sample7', duration: 50 },
      { title: 'RESTful API Design', videoUrl: 'https://youtube.com/watch?v=sample8', duration: 60 },
      { title: 'Authentication với JWT', videoUrl: 'https://youtube.com/watch?v=sample9', duration: 75 },
    ],
  },
  // Lessons cho course MongoDB
  {
    courseIndex: 2,
    lessons: [
      { title: 'Giới thiệu NoSQL và MongoDB', videoUrl: 'https://youtube.com/watch?v=sample10', duration: 40 },
      { title: 'CRUD Operations', videoUrl: 'https://youtube.com/watch?v=sample11', duration: 55 },
      { title: 'Mongoose ODM', videoUrl: 'https://youtube.com/watch?v=sample12', duration: 50 },
    ],
  },
];

// Import data
const importData = async () => {
  try {
    // Xóa dữ liệu cũ
    console.log('🗑️  Đang xóa dữ liệu cũ...');
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Enrollment.deleteMany();
    console.log('✅ Đã xóa dữ liệu cũ');

    // Hash passwords và tạo users
    console.log('👥 Đang tạo users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Đã tạo ${createdUsers.length} users`);

    // Lấy providers để gán cho courses
    const provider1 = createdUsers.find(u => u.email === 'provider1@edupress.com');
    const provider2 = createdUsers.find(u => u.email === 'provider2@edupress.com');

    // Gán provider cho courses (xen kẽ provider1 và provider2)
    const coursesWithProvider = coursesData.map((course, index) => ({
      ...course,
      provider: index % 2 === 0 ? provider1._id : provider2._id,
    }));

    // Tạo courses
    console.log('📚 Đang tạo courses...');
    const createdCourses = await Course.insertMany(coursesWithProvider);
    console.log(`✅ Đã tạo ${createdCourses.length} courses`);

    // Tạo lessons cho courses
    console.log('📝 Đang tạo lessons...');
    let totalLessons = 0;
    for (const lessonGroup of lessonsData) {
      const course = createdCourses[lessonGroup.courseIndex];
      const lessons = lessonGroup.lessons.map((lesson, index) => ({
        ...lesson,
        course: course._id,
        order: index + 1,
      }));
      await Lesson.insertMany(lessons);
      totalLessons += lessons.length;
    }
    console.log(`✅ Đã tạo ${totalLessons} lessons`);

    // Tạo enrollments mẫu
    console.log('🎓 Đang tạo enrollments...');
    const customer1 = createdUsers.find(u => u.email === 'customer1@edupress.com');
    const customer2 = createdUsers.find(u => u.email === 'customer2@edupress.com');

    const enrollments = [
      { user: customer1._id, course: createdCourses[0]._id, progress: 60 },
      { user: customer1._id, course: createdCourses[1]._id, progress: 30 },
      { user: customer2._id, course: createdCourses[0]._id, progress: 80 },
      { user: customer2._id, course: createdCourses[3]._id, progress: 20 },
    ];

    await Enrollment.insertMany(enrollments);
    console.log(`✅ Đã tạo ${enrollments.length} enrollments`);

    // Cập nhật enrollment count cho courses
    for (const course of createdCourses) {
      const count = enrollments.filter(e => e.course.toString() === course._id.toString()).length;
      course.enrollmentCount = count;
      await course.save();
    }

    console.log('\n🎉 ================================');
    console.log('🎉 SEED DATA THÀNH CÔNG!');
    console.log('🎉 ================================\n');

    console.log('📋 THÔNG TIN TÀI KHOẢN:\n');

    console.log('👨‍💼 ADMIN:');
    console.log('   Email: admin@edupress.com');
    console.log('   Password: admin123');
    console.log('   Role: admin\n');

    console.log('👨‍🏫 PROVIDERS:');
    console.log('   Email: provider1@edupress.com');
    console.log('   Password: provider123');
    console.log('   Role: provider');
    console.log('   Courses: React, MongoDB, UI/UX Design, Digital Marketing\n');

    console.log('   Email: provider2@edupress.com');
    console.log('   Password: provider123');
    console.log('   Role: provider');
    console.log('   Courses: Node.js, Python, Flutter, AWS\n');

    console.log('👨‍🎓 CUSTOMERS:');
    console.log('   Email: customer1@edupress.com');
    console.log('   Password: customer123');
    console.log('   Role: customer');
    console.log('   Enrolled: React (60%), Node.js (30%)\n');

    console.log('   Email: customer2@edupress.com');
    console.log('   Password: customer123');
    console.log('   Role: customer');
    console.log('   Enrolled: React (80%), Python (20%)\n');

    console.log('   Email: customer3@edupress.com');
    console.log('   Password: customer123');
    console.log('   Role: customer');
    console.log('   Status: pending_provider (chờ admin duyệt)\n');

    console.log('📊 THỐNG KÊ:');
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - ${createdCourses.length} courses`);
    console.log(`   - ${totalLessons} lessons`);
    console.log(`   - ${enrollments.length} enrollments`);
    console.log(`   - ${coursesWithProvider.filter(c => c.status === 'approved').length} approved courses`);
    console.log(`   - ${coursesWithProvider.filter(c => c.status === 'pending').length} pending courses\n`);

    process.exit();
  } catch (error) {
    console.error('❌ Lỗi khi import data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    console.log('🗑️  Đang xóa tất cả dữ liệu...');
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Enrollment.deleteMany();
    console.log('✅ Đã xóa tất cả dữ liệu');
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi khi xóa data:', error);
    process.exit(1);
  }
};

// Run script
if (process.argv[2] === '-d') {
  connectDB().then(deleteData);
} else {
  connectDB().then(importData);
}
