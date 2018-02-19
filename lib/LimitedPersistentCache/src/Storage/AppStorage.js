/**
 * Created by Karim on 22.07.2017.
 */
import AbstractStorage from './AbstractStorage';

import CountByNumberStrategy from './CountingStrategy/CountByNumberStrategy';
import CountBySizeStrategy from './CountingStrategy/CountBySizeStrategy';

import IStorageResponse from './IStorageResponse';

import { NotEnoughtMemory } from './Error/index';

const DEFAULTLIMITSIZE = 1;
const DEFAULTCOUNTINGSTRATEGY = new CountByNumberStrategy();

class AppStorage extends AbstractStorage {
    constructor(config={}) {
        super();

        this._limitSize = config.limitSize || DEFAULTLIMITSIZE;
        this.setCountingStrategy(DEFAULTCOUNTINGSTRATEGY);

        this._data = {};
    }

    async get(key) {
        let value = this._data[key];
        this._publish(new IStorageResponse(this.id, key, value, "get"));
        return value;
    }

    async set(key, value) {
        let sizeValue = this._countingStrategy.getSize(value),
            sizeAfterSet = this._currentSize + sizeValue,
            currentValue = this._data[key]
        ;

        if(sizeValue > this._limitSize) return new Error(new NotEnoughtMemory(this.id));

        if(currentValue) {
            sizeAfterSet -= this._countingStrategy.getSize(currentValue);
            delete this._data[key];
            this._currentSize -= sizeValue;
        }

        if(sizeAfterSet > this._limitSize)
            await this._memoryCancel(sizeAfterSet - this._limitSize);

        this._data[key] = value;
        this._currentSize += sizeValue;

        this._publish(new IStorageResponse(this.id, key, value, "set"));

        return value;
    }

    async remove(key) {
        let value = this._data[key];
        if(value) {
            delete this._data[key];
            this._currentSize -= this._countingStrategy.getSize(value);

            this._publish(new IStorageResponse(this.id, key, value, "remove"));
        }
        return value;
    }

    async _memoryCancel(size) {
        while(size > 0) {
            let oldestKey = this._getOldestKey(),
                oldestValue = this._data[oldestKey],
                oldestValueSize = this._countingStrategy.getSize(oldestValue)
            ;

            delete this._data[oldestKey];

            this._currentSize -= oldestValueSize;
            size -= oldestValueSize;

            if(this._expellingListener) await this._expellingListener({ id: this.id, key: oldestKey, value: oldestValue });
            this._publish(new IStorageResponse(this.id, oldestKey, oldestValue, "remove"));
        }
    }

    getSortedData() {
        return Object.keys(this._data).reverse().reduce((obj, currentKey) => {
            obj[currentKey] = this._data[currentKey];
            return obj;
        }, {});
    }

    getAllKeys() {
        return Object.keys(this._data);
    }

    _getOldestKey() {
        for(let key in this._data) return key;
    }

    _publish(changeObj) {
        if(this._listeners)
            Object.keys(this._listeners).forEach(key => this._listeners[key](changeObj));
    }
}

export default AppStorage;
