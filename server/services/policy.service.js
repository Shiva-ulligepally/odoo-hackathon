const PolicyRepository = require('../repositories/PolicyRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');

class PolicyService {
  async getPolicies(organizationId) {
    return await PolicyRepository.find({ organization: organizationId }, { populate: 'document' });
  }

  async createPolicy(organizationId, userId, data) {
    const policy = await PolicyRepository.create({
      ...data,
      organization: organizationId
    });

    await ActivityLogRepository.create({
      user: userId,
      organization: organizationId,
      action: 'Policy Created',
      details: `Created policy: "${policy.title}"`
    });

    return policy;
  }
}

module.exports = new PolicyService();
