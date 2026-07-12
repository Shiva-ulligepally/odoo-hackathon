const validateCreatePolicy = (data) => {
  const errors = [];
  const { title, description, effectiveDate, status, documentId } = data;

  if (!title) errors.push('Policy title is required');
  if (!description) errors.push('Policy description is required');

  if (errors.length > 0) {
    return { error: errors.join(', '), value: data };
  }

  return {
    error: null,
    value: {
      title,
      description,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      status: status || 'Draft',
      document: documentId || null
    }
  };
};

module.exports = {
  validateCreatePolicy
};
