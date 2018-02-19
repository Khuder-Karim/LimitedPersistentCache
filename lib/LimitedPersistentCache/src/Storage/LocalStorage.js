/**
 * Created by Karim on 22.07.2017.
 */
import AbstractStorage from './AbstractStorage';

import CountByNumberStrategy from './CountingStrategy/CountByNumberStrategy';
import CountBySizeStrategy from './CountingStrategy/CountBySizeStrategy';

import IStorageResponse from './IStorageResponse';

const DEFAULTLIMITSIZE = 1;
const DEFAULTCACHENAME = "cache:";
const DEFAULTCOUNTINGSTRATEGY = new CountByNumberStrategy();

class LocalStorage extends AbstractStorage {
    constructor(config={}) {
        super();

        this._limitSize = config.limitSize || DEFAULTLIMITSIZE;
        this._cacheName = config.cacheName || DEFAULTCACHENAME;
        this.setCountingStrategy(DEFAULTCOUNTINGSTRATEGY);

        this._data = localStorage;
        this._currentSize = this._getInitialSize();
    }

    _getFullKey(key) {
        return `${this._cacheName}${key}`;
    }

    _getKeysFromLocalstorage() {
        return Object.keys(this._data).filter(key => key.includes(this._cacheName));
    }

    _getInitialSize() {
        return (
            this._getKeysFromLocalstorage()
                .map(key => this._data.getItem(key))
                .reduce((sum, data) => sum += this._countingStrategy.getSize(data), 0)
        )
    }

    async get(key) {
        let fullKey = this._getFullKey(key),
            parseData = JSON.parse(this._data.getItem(fullKey)),
            value = parseData ? parseData.value : null
        ;
        this._publish(new IStorageResponse(this.id, key, value, "get"));
        return parseData ? value : null;
    }

    async set(key, value) {
        let stringifyValue = JSON.stringify({ _ts: Date.now(), value: value }),
            fullKey = this._getFullKey(key),
            sizeValue = this._countingStrategy.getSize(stringifyValue),
            sizeAfterSet = this._currentSize + sizeValue,
            currentValue = this._data.getItem(fullKey)
        ;

        if(currentValue) {
            sizeAfterSet -= this._countingStrategy.getSize(currentValue);
            this._data.removeItem(fullKey);
            this._currentSize -= sizeValue;
        }

        if(sizeAfterSet > this._limitSize)
            await this._memoryCancel(sizeAfterSet - this._limitSize);

        this._data.setItem(fullKey, stringifyValue);
        this._currentSize += sizeValue;

        this._publish(new IStorageResponse(this.id, key, value, "set"));
        return value;
    }

    async remove(key) {
        let fullKey = this._getFullKey(key),
            value = this._data.getItem(fullKey)
        ;
        if(value) {
            this._data.removeItem(fullKey);
            this._currentSize -= this._countingStrategy.getSize(value);

            this._publish(new IStorageResponse(this.id, key, value, "remove"));
            return key;
        }
        return null;
    }

    getSortedData() {
        return this._getKeysFromLocalstorage()
            .sort((aKey, bKey) => JSON.parse(this._data.getItem(bKey))._ts - JSON.parse(this._data.getItem(aKey))._ts)
            .reduce((obj, currentKey) => {
                let realKey = currentKey.split(`${this._cacheName}`)[1];
                obj[realKey] = this._data.getItem(currentKey);
                return obj;
            }, {})
        ;
    }

    _getOldestFullKey() {
        let allCacheKeys = this._getKeysFromLocalstorage(),
            oldest,
            min
        ;

        allCacheKeys.forEach(key => {
            let data = this._getFullKey(key);
            if(!min || min < data._ts) {
                min = data._ts;
                oldest = key;
            }
        });

        return oldest;
    }

    async _memoryCancel(size) {
        while(size > 0) {
            let oldestFullKey = this._getOldestFullKey(),
                normalKey = oldestFullKey.split(`${this._cacheName}`)[1],
                oldestValue = this._data.getItem(oldestFullKey),
                oldestValueSize = this._countingStrategy.getSize(oldestValue),
                parsedOldestValue = JSON.parse(oldestValue)
            ;

            this._data.removeItem(oldestFullKey);

            this._currentSize -= oldestValueSize;
            size -= oldestValueSize;

            if(this._expellingListener) await this._expellingListener({ id: this.id, key: normalKey, value: parsedOldestValue.value });
            this._publish(new IStorageResponse(this.id, normalKey, parsedOldestValue.value, "remove"));
        }
    }

    getAllKeys() {
        return this._getKeysFromLocalstorage().map(fullKey => fullKey.split(`${this._cacheName}`)[1]);
    }

    _publish(changeObj) {
        if(this._listeners)
            Object.keys(this._listeners).forEach(key => this._listeners[key](changeObj));
    }
}

export default LocalStorage;
