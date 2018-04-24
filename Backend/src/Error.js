class ExtendableError extends Error {
    constructor(message, code) {
      super();
      this.message = message; 
      this.code = code;
      this.stack = (new Error()).stack;
      this.name = this.constructor.name;
    }
}    
  
export class MyError extends ExtendableError {
    constructor(m, c) {   
      super(m, c);
    }
}
