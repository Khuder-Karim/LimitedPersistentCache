/**
 * Created by Karim on 23.07.2017.
 */
class NotEnoughtMemory {
    constructor(storageId, message) {
        this.name = this.constructor.name;
        this.storageId = storageId;
        this.message = message || `Too big value for storage ${storageId}`;
    }
}
NotEnoughtMemory.prototype = Object.create(Error.prototype);

export {
    NotEnoughtMemory
};
