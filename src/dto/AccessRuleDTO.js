export class AccessRuleDTO {
  constructor({ id = null, name = '', allowedJobIds = [] } = {}) {
    this.id = id;
    this.name = name;
    this.allowedJobIds = Array.isArray(allowedJobIds) ? allowedJobIds : [];
  }
}

export default AccessRuleDTO;
