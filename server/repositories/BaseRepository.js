class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(query = {}, options = {}) {
    let execution = this.model.find(query);

    if (options.populate) {
      execution = execution.populate(options.populate);
    }
    if (options.sort) {
      execution = execution.sort(options.sort);
    }
    if (options.select) {
      execution = execution.select(options.select);
    }
    if (options.skip) {
      execution = execution.skip(options.skip);
    }
    if (options.limit) {
      execution = execution.limit(options.limit);
    }

    return await execution;
  }

  async findOne(query = {}, options = {}) {
    let execution = this.model.findOne(query);

    if (options.populate) {
      execution = execution.populate(options.populate);
    }
    if (options.select) {
      execution = execution.select(options.select);
    }

    return await execution;
  }

  async findById(id, options = {}) {
    let execution = this.model.findById(id);

    if (options.populate) {
      execution = execution.populate(options.populate);
    }
    if (options.select) {
      execution = execution.select(options.select);
    }

    return await execution;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data, options = { new: true, runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(query = {}) {
    return await this.model.countDocuments(query);
  }
}

module.exports = BaseRepository;
