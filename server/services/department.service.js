const DepartmentRepository = require('../repositories/DepartmentRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const CustomError = require('../utils/customError');

class DepartmentService {
  async getDepartments(organizationId) {
    return await DepartmentRepository.find({ organization: organizationId }, { populate: 'manager' });
  }

  async createDepartment(organizationId, userId, departmentData) {
    const existing = await DepartmentRepository.findOne({ name: departmentData.name, organization: organizationId });
    if (existing) {
      throw new CustomError('Department name already exists in this organization', 400);
    }

    const dept = await DepartmentRepository.create({
      ...departmentData,
      organization: organizationId
    });

    await ActivityLogRepository.create({
      user: userId,
      organization: organizationId,
      action: 'Department Created',
      details: `Created department ${dept.name} (${dept.code})`
    });

    return dept;
  }

  async updateDepartment(id, organizationId, userId, updateData) {
    const dept = await DepartmentRepository.findOne({ _id: id, organization: organizationId });
    if (!dept) {
      throw new CustomError('Department not found', 404);
    }

    const updated = await DepartmentRepository.update(id, updateData);

    await ActivityLogRepository.create({
      user: userId,
      organization: organizationId,
      action: 'Department Updated',
      details: `Updated department ${dept.name}`
    });

    return updated;
  }

  async deleteDepartment(id, organizationId, userId) {
    const dept = await DepartmentRepository.findOne({ _id: id, organization: organizationId });
    if (!dept) {
      throw new CustomError('Department not found', 404);
    }

    await DepartmentRepository.delete(id);

    await ActivityLogRepository.create({
      user: userId,
      organization: organizationId,
      action: 'Department Deleted',
      details: `Deleted department ${dept.name}`
    });

    return { id };
  }
}

module.exports = new DepartmentService();
