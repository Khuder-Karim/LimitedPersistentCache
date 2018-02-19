import * as Storage from './Storage';
import * as CountStrategy from './Storage/CountingStrategy';

import IStorageResponse from './Storage/IStorageResponse';
import { NotEnoughtMemory } from './Storage/Error/index';
import LocalStorage from "./Storage/LocalStorage";

import { v1 } from 'uuid';

class Cache {
    constructor() {
        this._levels = [];
        this._changeListeners = {};
        this._queueRequest = [];

        this._isBlockCache = false;

        this.set = this._blockCache(this.set);
        this.get = this._blockCache(this.get);
        this.remove = this._blockCache(this.remove);

        this._expellingListener = this._expellingListener.bind(this);
        this._storageListener = this._storageListener.bind(this);
    }

    subscribe(func) {
        if(typeof func === "function") {
            let uniqKey = v1();
            this._changeListeners[uniqKey] = func;
            return uniqKey;
        }

        return null;
    }

    unSubscribe(key) {
        return delete this._changeListeners[key];
    }

    _blockCache(func) {
        return function block() {
            return new Promise(async (resolve, reject) => {
                if(this._isBlockCache) {
                    let newItemInQueue = block.bind(this, ...arguments);
                    newItemInQueue.resolve = resolve;
                    newItemInQueue.reject = reject;
                    this._queueRequest.push(newItemInQueue);
                    return;
                }

                this._isBlockCache = true;
                let result = await func.apply(this, arguments);
                this._isBlockCache = false;

                if (this._queueRequest.length) {
                    let headQueue = this._queueRequest.shift();
                    headQueue().then(headQueue.resolve).catch(headQueue.catch);
                }

                !(result instanceof Error)
                    ? resolve(result)
                    : reject(result.message)
                ;
            })
        };
    }

    addStorage(storage) {
        if(!this._isValidStorage(storage)) return false;

        storage.setExpellingListener(this._expellingListener);
        storage.subscribe(this._storageListener);
        this._levels.push({ id: storage.id, storage: storage });

        return storage.id;
    }

    removeStorage(storageId) {
        let index = this._levels.map(level => level.id).indexOf(storageId);
        if(index >= 0) {
            this._levels.splice(index, 1);
            return true;
        }
        return false;
    }

    getAllStorage() {
        return this._levels.map(level => level.storage);
    }

    getStorageById(id) {
        return this._levels.map(level => level.storage).find(storage => storage.id === id);
    }

    async get(key) {
        let { storageId, value } = await this._recursiveGet(key);

        if(value) {
            let targetStorage = this.getStorageById(storageId);
            await targetStorage.remove(key);
            return await this._recursiveSet(key, value);
        } else {
            return null;
        }
    }
    async _recursiveGet(key, fromLevel=0) {
        let currentLevel = this._levels[fromLevel];
        if (!currentLevel) return {};

        let value = await currentLevel.storage.get(key);

        return value ? { storageId: currentLevel.id, value: value } : this._recursiveGet(key, fromLevel+1);
    }

    async set(key, value) {
        let result = await this._recursiveGet(key);
        if(result.value) {
            let targetStorage = this.getStorageById(result.storageId);
            await targetStorage.remove(key);
        }
        return await this._recursiveSet(key, value);
    }
    async _recursiveSet(key, value, toLevel=0) {
        let currentLevel = this._levels[toLevel];
        if(!currentLevel) return new Error("no suitable storage");

        let response;
        try {
            response = await currentLevel.storage.set(key, value);
        }
        catch(err) {
            if(err instanceof NotEnoughtMemory) return this._recursiveSet(key, value, toLevel+1);
            else return err;
        }

        return response;
    }

    async remove(key) {
        return await this._recursiveRemove(key);
    }
    async _recursiveRemove(key, fromLevel=0) {
        let currentLevel = this._levels[fromLevel];
        if(!currentLevel) return null;

        let value = await currentLevel.storage.remove(key);

        return value ? value : this._recursiveRemove(key, fromLevel+1);
    }

    async _expellingListener({ id, key, value }) {
        let currentPos = this._getStoragePosById(id);
        return currentPos >= 0 ? await this._recursiveSet(key, value, currentPos+1) : null;
    }

    _getStoragePosById(storageId) {
        return this._levels.map(obj => obj.id).indexOf(storageId);
    }

    _storageListener(changeObj) {
        if(!(changeObj instanceof IStorageResponse)) return null;
        Object.keys(this._changeListeners).forEach(key => this._changeListeners[key](changeObj));
    }

    _getNextStorage(id) {
        let currentPositionStorage = this._levels.map(obj => obj.id).indexOf(id);
        let nextStorage = this._levels[currentPositionStorage+1];
        return nextStorage ? nextStorage.storage : null;
    }

    _isValidStorage(storage) {
        let isGood = true;
        if(storage instanceof Storage.LocalStorage) {
            this._levels.forEach(level => {
                if(level.storage instanceof Storage.LocalStorage)
                    isGood = false;
            });
        }
        return isGood;
    }
}

export {
    CountStrategy,
    Storage,
    Cache
};
