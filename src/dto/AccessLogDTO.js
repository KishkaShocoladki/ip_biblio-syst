export class AccessLogDTO {
  constructor({ id = null, userId = null, when = null, doorId = null, status = 'denied', type = 'enter' } = {}) {
    this.id = id;
    this.userId = userId;
    this.when = when; // ISO string or Date
    this.doorId = doorId;
    this.status = status; // 'granted'|'denied'
    this.type = type; // 'enter'|'exit'
  }
}

export default AccessLogDTO;
