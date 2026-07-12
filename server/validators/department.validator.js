const validateCreateDepartment = (data) => {
  const errors = [];
  const { name, code, description, manager } = data;

  if (!name) errors.push('Department name is required');
  if (!code) errors.push('Department code is required');

  if (errors.length > 0) {
    return { error: errors.join(', '), value: data };
  }

  return { error: null, value: { name, code, description, manager } };
};

const validateUpdateDepartment = (data) => {
  const { name, code, description, manager } = data;
  // All fields are optional during update
  return { error: null, value: { name, code, description, manager } };
};

module.exports = {
  validateCreateDepartment,
  validateUpdateDepartment
};
