/**
 * Created by Karim on 22.07.2017.
 */
import { v1 } from 'uuid';

import ICountingStrategy from './CountingStrategy/ICountingStrategy';

class AbstractStorage {
    constructor() {
        this.id = v1();

        this._limitSize = 0;
        this._currentSize = 0;

        this._expellingListener = null;
        this._listeners = {};
        this._countingStrategy = null;
    }

    async get(key) {}
    async set(key, value) {}
    async remove(key) {}
    getSortedKeys() {}
    getAllKeys() {}

    subscribe(func) {
        if(typeof func === "function") {
            let uniqKey = v1();
            this._listeners[uniqKey] = func;

            return uniqKey;
        }
        return false;
    }

    unSubscribe(uniqKey) {
        return delete this._listeners[uniqKey];
    }

    setExpellingListener(listener) {

        if(typeof listener === "function") {
            this._expellingListener = listener;
            return true;
        }
        return false;
    }

    getStat() {
        return {
            limitSize: this._limitSize,
            currentSize: this._currentSize,
            fullness: this._currentSize ? this._currentSize / this._limitSize : 0
        }
    }

    setCountingStrategy(strategy) {
        if(strategy instanceof ICountingStrategy) {
            this._countingStrategy = strategy;
            return true;
        }
        return false;
    }
}

export default AbstractStorage;
