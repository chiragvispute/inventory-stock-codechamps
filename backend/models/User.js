import { pool } from '../db.js';

/**
 * User model for handling user operations
 */
export class UserModel {
  
  /**
   * Get all users
   */
  static async getAllUsers() {
    const query = `
      SELECT user_id, login_id, email, user_role, first_name, last_name, 
             created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    const query = `
      SELECT user_id, login_id, email, user_role, first_name, last_name, 
             created_at, updated_at 
      FROM users 
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Get user by login ID
   */
  static async getUserByLoginId(loginId) {
    const query = `
      SELECT user_id, login_id, email, password, user_role, first_name, last_name, 
             otp_secret, created_at, updated_at 
      FROM users 
      WHERE login_id = $1
    `;
    const result = await pool.query(query, [loginId]);
    return result.rows[0];
  }

  /**
   * Create new user
   */
  static async createUser(userData) {
    const { loginId, email, password, userRole, firstName, lastName, otpSecret } = userData;
    
    const query = `
      INSERT INTO users (login_id, email, password, user_role, first_name, last_name, otp_secret)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, login_id, email, user_role, first_name, last_name, created_at
    `;
    
    const result = await pool.query(query, [loginId, email, password, userRole, firstName, lastName, otpSecret]);
    return result.rows[0];
  }

  /**
   * Update user
   */
  static async updateUser(userId, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramCount}`);
        values.push(userData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramCount}
      RETURNING user_id, login_id, email, user_role, first_name, last_name, updated_at
    `;
    
    values.push(userId);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete user
   */
  static async deleteUser(userId) {
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}