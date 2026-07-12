const validateCreateReport = (data) => {
  const errors = [];
  const { title, type, dateRangeStart, dateRangeEnd, documentId } = data;

  if (!title) errors.push('Report title is required');
  if (!type) errors.push('Report type is required');
  if (!dateRangeStart) errors.push('Date range start date is required');
  if (!dateRangeEnd) errors.push('Date range end date is required');

  if (errors.length > 0) {
    return { error: errors.join(', '), value: data };
  }

  return {
    error: null,
    value: {
      title,
      type,
      dateRange: {
        start: new Date(dateRangeStart),
        end: new Date(dateRangeEnd)
      },
      document: documentId || null
    }
  };
};

module.exports = {
  validateCreateReport
};
