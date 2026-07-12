const OrganizationRepository = require('../repositories/OrganizationRepository');

class OrganizationService {
  async getProfile(organizationId) {
    return await OrganizationRepository.findById(organizationId);
  }

  async updateProfile(organizationId, updateData) {
    return await OrganizationRepository.update(organizationId, updateData);
  }
}

module.exports = new OrganizationService();
