import bcrypt from 'bcryptjs';
import { sequelize } from '../db.js';
import { UserModel } from '../models/User.js';

/**
 * Update sample user passwords with proper bcrypt hashes
 */
export async function updateUserPasswords() {
  try {
    console.log('🔑 Updating user passwords...');
    
    // Test users with their passwords
    const testUsers = [
      { loginId: 'admin', password: 'admin123' },
      { loginId: 'manager1', password: 'manager123' },
      { loginId: 'operator1', password: 'operator123' },
      // Add our existing test users
      { loginId: 'testuser', email: 'test@example.com', password: 'testpass', firstName: 'Test', lastName: 'User', role: 'admin' },
      { loginId: 'manager', email: 'manager@example.com', password: 'manager123', firstName: 'Manager', lastName: 'User', role: 'manager' }
    ];

    for (const userData of testUsers) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Check if user exists
      const existingUser = await UserModel.getUserByLoginId(userData.loginId);
      
      if (existingUser) {
        // Update existing user password
        await UserModel.updateUser(existingUser.user_id, {
          password: hashedPassword
        });
        console.log(`✅ Updated password for: ${userData.loginId}`);
      } else if (userData.email) {
        // Create new user if it doesn't exist (for testuser and manager)
        await UserModel.createUser({
          loginId: userData.loginId,
          email: userData.email,
          password: hashedPassword,
          userRole: userData.role || 'staff',
          firstName: userData.firstName,
          lastName: userData.lastName
        });
        console.log(`✅ Created user: ${userData.loginId}`);
      } else {
        console.log(`⚠️  User ${userData.loginId} not found in database`);
      }
    }
    
    console.log('🎉 User passwords updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating user passwords:', error);
    throw error;
  }
}

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateUserPasswords()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}