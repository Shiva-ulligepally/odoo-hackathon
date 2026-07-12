const validateCreateEmployee = (data) => {
  const errors = [];
  const { email, password, role, name, employeeId, departmentId } = data;

  if (!email) errors.push('Email is required');
  if (!password || password.length < 6) errors.push('Password is required and must be at least 6 characters');
  if (!name) errors.push('Employee name is required');
  if (!employeeId) errors.push('Employee ID is required');
  if (!departmentId) errors.push('Department ID is required');

  if (errors.length > 0) {
    return { error: errors.join(', '), value: data };
  }

  return { error: null, value: { email, password, role: role || 'Employee', name, employeeId, departmentId } };
};

module.exports = {
  validateCreateEmployee
};
