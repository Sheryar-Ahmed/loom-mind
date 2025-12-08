/**
 * Standardized API Response Class
 * Ensures consistent response format across all endpoints
 */
class ApiResponse {
  /**
   * Create a successful response
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response data
   * @param {string} message - Optional success message
   * @param {Object} pagination - Optional pagination data
   */
  constructor(statusCode, data, message = 'Success', pagination = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    
    if (pagination) {
      this.pagination = pagination;
    }
  }

  /**
   * Send the response
   * @param {Object} res - Express response object
   */
  send(res) {
    const response = {
      success: this.success,
      message: this.message,
      data: this.data,
    };

    if (this.pagination) {
      response.pagination = this.pagination;
    }

    return res.status(this.statusCode).json(response);
  }
}

/**
 * Helper functions for common response types
 */
const success = (res, data, message = 'Success') => {
  return new ApiResponse(200, data, message).send(res);
};

const created = (res, data, message = 'Created successfully') => {
  return new ApiResponse(201, data, message).send(res);
};

const updated = (res, data, message = 'Updated successfully') => {
  return new ApiResponse(200, data, message).send(res);
};

const deleted = (res, message = 'Deleted successfully') => {
  return new ApiResponse(200, null, message).send(res);
};

const paginated = (res, data, pagination, message = 'Success') => {
  return new ApiResponse(200, data, message, pagination).send(res);
};

module.exports = {
  ApiResponse,
  success,
  created,
  updated,
  deleted,
  paginated,
};
