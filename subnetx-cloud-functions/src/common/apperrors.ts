export class ApplicationError extends Error{

}

export class InvalidArguments extends ApplicationError{
    constructor(message?: string){
        super(message);
        this.name = 'InvalidArguments';
        this.message = message || 'Arguments are invalid.';
    }
}

export class OwnershipError extends ApplicationError{
    constructor(message?: string){
        super(message);
        this.name = 'NotOwned';
        this.message = message || 'Pixels are not owned.';
    }
}
