const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const OrganizationRepository = require('../repositories/OrganizationRepository');
const EmployeeRepository = require('../repositories/EmployeeRepository');
const DepartmentRepository = require('../repositories/DepartmentRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const CustomError = require('../utils/customError');

class AuthService {
  async registerAdmin({ email, password, organizationName, industry, location }) {
    // 1. Create Organization
    let organization = await OrganizationRepository.findOne({ name: organizationName });
    if (organization) {
      throw new CustomError('Organization name already exists', 400);
    }
    organization = await OrganizationRepository.create({
      name: organizationName,
      industry,
      location
    });

    // 2. Create Admin User
    const existingUser = await UserRepository.findOne({ email });
    if (existingUser) {
      throw new CustomError('Email already registered', 400);
    }

    const user = await UserRepository.create({
      email,
      password,
      role: 'Admin',
      organization: organization._id
    });

    // 3. Create Default Department for Organization
    const department = await DepartmentRepository.create({
      name: 'Executive Board',
      code: 'EXEC',
      organization: organization._id,
      description: 'Primary corporate management division'
    });

    // 4. Create Employee Profile for Admin
    const employee = await EmployeeRepository.create({
      user: user._id,
      name: 'System Admin',
      employeeId: 'EMP-ADMIN',
      department: department._id,
      organization: organization._id
    });

    // Link employee to department manager
    department.manager = employee._id;
    await department.save();

    // 5. Create audit log
    await ActivityLogRepository.create({
      user: user._id,
      organization: organization._id,
      action: 'Organization Registered',
      details: `Registered organization ${organizationName} and admin user ${email}`
    });

    // Generate JWT Token
    const token = this.generateToken(user._id);

    return { user, employee, organization, token };
  }

  async login(email, password) {
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new CustomError('Invalid credentials', 401);
    }

    if (user.status === 'Inactive') {
      throw new CustomError('User account has been deactivated', 403);
    }

    const employee = await EmployeeRepository.findByUserId(user._id);
    const token = this.generateToken(user._id);

    // Create Audit Log
    await ActivityLogRepository.create({
      user: user._id,
      organization: user.organization,
      action: 'User Logged In',
      details: `User ${email} successfully logged in`
    });

    return { user, employee, token };
  }

  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_enterprise_production_123!', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }
}

module.exports = new AuthService();
