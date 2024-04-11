class ApiErrors extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        stack="",
        errors=[]
    ){
        super(message);
        this.errors = errors;
        this.statusCode = statusCode
        this.data = null;
        this.success = false;
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor) 
            // The Error.captureStackTrace() method is a feature in 
            // JavaScript that is used to create custom error objects.
            // It is typically used in constructor functions to capture 
            // the stack trace at the point where the error object is created. 
            // This can be helpful for debugging purposes, as it allows you to see 
            // the exact sequence of function calls that led to the error.
        }
    }
}
export {ApiErrors}