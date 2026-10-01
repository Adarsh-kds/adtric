const getValidationErrors = async (document) => {
  const errors = {};

  try {
    await document.validate();
  } catch (error) {
    if (error.name !== "ValidationError") {
      throw error;
    }
    Object.keys(error.errors).forEach((field) => {
      errors[field] = error.errors[field].message;
    });
  }

  return errors;
};

module.exports = getValidationErrors;
