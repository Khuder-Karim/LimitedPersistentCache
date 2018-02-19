import CountByNumberStrategy from './CountingStrategy/CountByNumberStrategy';
import CountBySizeStrategy from './CountingStrategy/CountBySizeStrategy';

import AppStorage from './AppStorage';

import IStorageResponse from './IStorageResponse';

import { NotEnoughtMemory } from './Error/index';

const DEFAULTLIMITSIZE = 2;
const DEFAULTCOUNTINGSTRATEGY = new CountByNumberStrategy();
const DEFAULTDELAY = 1000;

class AsyncStorage extends AppStorage {
    constructor(config = {}) {
        super();

        this._limitSize = config.limitSize || DEFAULTLIMITSIZE;
        this.setCountingStrategy(DEFAULTCOUNTINGSTRATEGY);

        this._data = {};

        this.get = this._delay(this.get);
        this.set = this._delay(this.set);
        this.remove = this._delay(this.remove);
    }

    _delay(func) {
        return async function() {
            await new Promise((resolve, reject) => setTimeout(() => resolve(), DEFAULTDELAY));
            return await func.apply(this, arguments);
        }
    }
}

export default AsyncStorage;