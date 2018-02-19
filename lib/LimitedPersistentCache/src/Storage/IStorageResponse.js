/**
 * Created by Karim on 23.07.2017.
 */

class IStorageResponse {
    constructor(id, key, value, command) {
        this.id = id;
        this.key = key;
        this.value = value;
        this.command = command;
    }
}

export default IStorageResponse;