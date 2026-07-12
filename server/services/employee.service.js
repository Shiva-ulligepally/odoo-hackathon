const EmployeeRepository = require('../repositories/EmployeeRepository');
const UserRepository = require('../repositories/UserRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const CustomError = require('../utils/customError');

class EmployeeService {
  async getEmployees(organizationId, filters = {}, options = {}) {
    const query = { organization: organizationId };
    
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }
    if (filters.department) {
      query.department = filters.department;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const employees = await EmployeeRepository.find(query, {
      populate: ['department', 'user', 'badges'],
      sort: options.sort || { name: 1 },
      skip,
      limit
    });

    const total = await EmployeeRepository.count(query);

    return {
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async createEmployee(organizationId, creatorUserId, employeeData) {
    // Check if email already registered
    const existingUser = await UserRepository.findOne({ email: employeeData.email });
    if (existingUser) {
      throw new CustomError('User email already exists', 400);
    }

    // Check Employee ID
    const existingEmp = await EmployeeRepository.findOne({ employeeId: employeeData.employeeId, organization: organizationId });
    if (existingEmp) {
      throw new CustomError('Employee ID already exists', 400);
    }

    // Create User first
    const user = await UserRepository.create({
      email: employeeData.email,
      password: employeeData.password,
      role: employeeData.role || 'Employee',
      organization: organizationId
    });

    // Create Employee
    const employee = await EmployeeRepository.create({
      user: user._id,
      name: employeeData.name,
      employeeId: employeeData.employeeId,
      department: employeeData.departmentId,
      organization: organizationId
    });

    await ActivityLogRepository.create({
      user: creatorUserId,
      organization: organizationId,
      action: 'Employee Provisioned',
      details: `Created user and employee profile for ${employee.name} (ID: ${employee.employeeId})`
    });

    return employee;
  }

  async getLeaderboard(organizationId) {
    // Sort employees by points descending
    return await EmployeeRepository.find(
      { organization: organizationId, status: 'Active' },
      {
        populate: 'department',
        sort: { points: -1 },
        limit: 10
      }
    );
  }

  async getProfile(userId) {
    const employee = await EmployeeRepository.findByUserId(userId, { populate: ['department', 'badges', 'user'] });
    if (!employee) {
      throw new CustomError('Employee profile not found', 404);
    }
    return employee;
  }

  async updateProfile(userId, updateData) {
    const employee = await EmployeeRepository.findByUserId(userId);
    if (!employee) {
      throw new CustomError('Employee profile not found', 404);
    }

    const updated = await EmployeeRepository.update(employee._id, updateData, { new: true });
    return updated;
  }
}

module.exports = new EmployeeService();
