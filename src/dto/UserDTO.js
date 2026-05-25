export class UserDTO {
  constructor({ id = null, handle = '', email = '', role = 'user', jobId = null, password = null } = {}) {
    this.id = id;
    this.handle = handle;
    this.email = email;
    this.role = role;
    this.jobId = jobId;
    this.password = password;
  }
}

export default UserDTO;
