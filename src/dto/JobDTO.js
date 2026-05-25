export class JobDTO {
  constructor({ id = null, name = '' } = {}) {
    this.id = id;
    this.name = name;
  }
}

export default JobDTO;
