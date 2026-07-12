const validateCreateCarbon = (data) => {
  const errors = [];
  const { departmentId, scope, activityType, value, date, evidenceDocumentId } = data;

  if (!departmentId) errors.push('Department ID is required');
  if (!scope) errors.push('Scope is required');
  if (!activityType) errors.push('Activity Type is required');
  if (value === undefined || value === null || isNaN(value)) errors.push('Emission value is required and must be a number');

  if (errors.length > 0) {
    return { error: errors.join(', '), value: data };
  }

  return {
    error: null,
    value: {
      department: departmentId,
      scope,
      activityType,
      value: Number(value),
      date: date ? new Date(date) : new Date(),
      evidenceDocument: evidenceDocumentId || null
    }
  };
};

module.exports = {
  validateCreateCarbon
};
