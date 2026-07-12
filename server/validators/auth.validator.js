const validateRegister = (data) => {
  const errors = [];
  const { email, password, role, organizationName, industry, location } = data;

  if (!email) errors.push('Email is required');
  if (!password || password.length < 6) errors.push('Password is required and must be at least 6 characters');
  if (!organizationName) errors.push('Organization Name is required');
  if (!industry) errors.push('Industry is required');
  if (!location) errors.push('Location is required');

  if (errors.length > 0) {
    return { error: errors.join(', '), value: data };
  }

  return { error: null, value: { email, password, role: role || 'Employee', organizationName, industry, location } };
};

const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return { error: errors.join(', '), value: data };
  }

  return { error: null, value: { email, password } };
};

module.exports = {
  validateRegister,
  validateLogin
};
