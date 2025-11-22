import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

// Define User model with Sequelize
const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'user_id'
  },
  login_id: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    field: 'login_id'
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    field: 'email',
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password'
  },
  user_role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'viewer',
    field: 'user_role',
    validate: {
      isIn: [['admin', 'manager', 'operator', 'viewer']]
    }
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  otp_secret: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'otp_secret'
  },
  reset_otp: {
    type: DataTypes.STRING(6),
    allowNull: true,
    field: 'reset_otp'
  },
  reset_otp_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reset_otp_expires'
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

/**
 * User model for handling user operations
 */
export class UserModel {
  
  /**
   * Get all users
   */
  static async getAllUsers() {
    const users = await User.findAll({
      attributes: ['user_id', 'login_id', 'email', 'user_role', 'first_name', 'last_name', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });
    return users.map(user => user.dataValues);
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    const user = await User.findOne({
      where: { user_id: userId },
      attributes: ['user_id', 'login_id', 'email', 'user_role', 'first_name', 'last_name', 'created_at', 'updated_at']
    });
    return user ? user.dataValues : null;
  }

  /**
   * Get user by login ID
   */
  static async getUserByLoginId(loginId) {
    const user = await User.findOne({
      where: { login_id: loginId },
      attributes: ['user_id', 'login_id', 'email', 'password', 'user_role', 'first_name', 'last_name', 'otp_secret', 'created_at', 'updated_at']
    });
    return user ? user.dataValues : null;
  }

  /**
   * Create new user
   */
  static async createUser(userData) {
    const { loginId, email, password, userRole, firstName, lastName, otpSecret } = userData;
    
    const user = await User.create({
      login_id: loginId,
      email,
      password,
      user_role: userRole,
      first_name: firstName,
      last_name: lastName,
      otp_secret: otpSecret
    });
    
    // Return without sensitive data
    const { password: _, otp_secret: __, ...safeUser } = user.dataValues;
    return safeUser;
  }

  /**
   * Update user
   */
  static async updateUser(userId, userData) {
    const updateFields = {};
    
    // Map camelCase to snake_case for database fields
    if (userData.loginId !== undefined) updateFields.login_id = userData.loginId;
    if (userData.email !== undefined) updateFields.email = userData.email;
    if (userData.password !== undefined) updateFields.password = userData.password;
    if (userData.userRole !== undefined) updateFields.user_role = userData.userRole;
    if (userData.firstName !== undefined) updateFields.first_name = userData.firstName;
    if (userData.lastName !== undefined) updateFields.last_name = userData.lastName;
    if (userData.otpSecret !== undefined) updateFields.otp_secret = userData.otpSecret;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No fields to update');
    }

    const [affectedRows] = await User.update(updateFields, {
      where: { user_id: userId }
    });

    if (affectedRows === 0) {
      return null;
    }

    // Return updated user without sensitive data
    return await this.getUserById(userId);
  }

  /**
   * Delete user
   */
  static async deleteUser(userId) {
    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) return null;
    
    await User.destroy({ where: { user_id: userId } });
    return user.dataValues;
  }
}

// Export the Sequelize model as well for direct use if needed
export { User };