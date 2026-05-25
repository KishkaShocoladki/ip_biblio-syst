export class DoorDTO {
  constructor({ id = null, name = '', accessRuleIds = [] } = {}) {
    this.id = id;
    this.name = name;
    this.accessRuleIds = Array.isArray(accessRuleIds) ? accessRuleIds : [];
  }
}

export default DoorDTO;
