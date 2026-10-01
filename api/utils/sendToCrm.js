const axios = require("axios");

const sendToCrm = async (enquiry, projectName) => {
  try {
    await axios.post(
      process.env.CRM_WEBHOOK_URL,
      {
        name: enquiry.name,
        mobile: enquiry.mobile,
        email: enquiry.email,
        project: projectName,
        message: enquiry.message,
        createdAt: enquiry.createdAt,
      },
      { timeout: 5000 }
    );
    return true;
  } catch (error) {
    console.error("CRM push failed:", error.message);
    return false;
  }
};

module.exports = sendToCrm;
