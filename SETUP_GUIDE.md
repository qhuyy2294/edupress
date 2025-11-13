# Edupress - Quick Start Guide

## 🎯 Complete Setup Instructions

### Step 1: Backend Setup

1. **Open a terminal and navigate to the backend directory:**
```bash
cd backend
```

2. **Install all dependencies:**
```bash
npm install
```

3. **Verify the .env file configuration:**
Make sure your `.env` file contains:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edupress
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

4. **Start MongoDB:**
- **Windows:** Open Command Prompt as Administrator
  ```bash
  net start MongoDB
  ```
- **macOS/Linux:**
  ```bash
  sudo systemctl start mongod
  ```

5. **Start the backend server:**
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
```

### Step 2: Frontend Setup

1. **Open a NEW terminal and navigate to the client directory:**
```bash
cd client
```

2. **Install all dependencies:**
```bash
npm install
```

3. **Start the React application:**
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

### Step 3: Create an Admin User

Since the application doesn't allow admin registration through the UI, you need to create an admin user manually in MongoDB.

**Option 1: Using MongoDB Compass (GUI)**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select the `edupress` database
4. Select the `users` collection
5. Click "ADD DATA" → "Insert Document"
6. Paste this JSON (replace the password hash):

```json
{
  "fullName": "Admin User",
  "email": "admin@edupress.com",
  "password": "$2a$10$5vZ8qYx1qQx9xX9x9X9x9.x9x9x9x9x9x9x9x9x9x9x9x9x9x",
  "role": "admin",
  "status": "active",
  "avatarUrl": "default_avatar.png",
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

**Option 2: Using MongoDB Shell**
```bash
mongosh
use edupress
db.users.insertOne({
  fullName: "Admin User",
  email: "admin@edupress.com",
  password: "$2a$10$5vZ8qYx1qQx9xX9x9X9x9.x9x9x9x9x9x9x9x9x9x9x9x9x9x",
  role: "admin",
  status: "active",
  avatarUrl: "default_avatar.png",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**To generate a proper password hash:**
1. In the backend directory, create a file `hashPassword.js`:
```javascript
const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'admin123'; // Change this to your desired password
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  console.log('Hashed password:', hashed);
}

hashPassword();
```

2. Run it:
```bash
node hashPassword.js
```

3. Copy the hashed password and use it in the MongoDB insert command above.

### Step 4: Test the Application

1. **Register a regular user:**
   - Go to `http://localhost:3000/register`
   - Create a customer account
   - Email: `user@test.com`
   - Password: `password123`

2. **Login as admin:**
   - Go to `http://localhost:3000/login`
   - Email: `admin@edupress.com`
   - Password: `admin123` (or whatever you set)
   - You should see "Admin Dashboard" in the navigation

3. **Request to become a provider:**
   - Login as customer
   - Navigate to "Become Provider"
   - Submit request
   - Login as admin to approve the request

4. **Create a course:**
   - Login as approved provider
   - Navigate to "Create Course"
   - Fill in course details
   - Login as admin to approve the course

## 🔧 Troubleshooting

### MongoDB Connection Error
**Problem:** Can't connect to MongoDB
**Solution:** 
- Make sure MongoDB is running
- Check if the connection string in `.env` is correct
- Try connecting with MongoDB Compass to verify

### Port Already in Use
**Problem:** Port 5000 or 3000 is already in use
**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux - Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### CORS Error
**Problem:** CORS policy blocking requests
**Solution:**
- Make sure backend is running on port 5000
- Check `CLIENT_URL` in backend `.env` file
- Restart both backend and frontend

### JWT Token Issues
**Problem:** "Not authorized" errors
**Solution:**
- Clear browser localStorage
- Re-login
- Check if JWT_SECRET is set in `.env`

## 📝 Default Test Accounts

After setup, you'll have:

**Admin Account:**
- Email: `admin@edupress.com`
- Password: `admin123` (or your custom password)
- Role: Admin

**Customer Account** (you create):
- Email: `user@test.com`
- Password: `password123`
- Role: Customer

## 🎨 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 📚 Next Steps

1. ✅ Create some sample courses
2. ✅ Test the enrollment flow
3. ✅ Explore the admin dashboard
4. ✅ Customize the UI styling
5. ✅ Add more features as needed

## 🆘 Need Help?

If you encounter any issues:
1. Check the console logs (both backend and frontend)
2. Verify all dependencies are installed
3. Make sure MongoDB is running
4. Check environment variables are set correctly

---

**Congratulations! Your Edupress platform is ready! 🎉**
