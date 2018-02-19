/**
 * Created by Karim on 23.07.2017.
 */
import React, { Component } from 'react';
import { Row, Col }         from 'react-bootstrap';

import { Storage, CountStrategy } from 'LimitedPersistentCache';
import { generateItem }           from 'utils';

import Generator      from '../components/Generator.js';
import StorageManager from '../components/StorageManager.js';
import KeyValueForm   from '../components/KeyValueForm.js';

import StorageList    from './StorageList';


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            storages: []
        };

        this.addStorage  = this.addStorage.bind(this);
        this.generateSet = this.generateSet.bind(this);
        this.generateGet = this.generateGet.bind(this);
    }

    addStorage({ limit, physicalType, logicalType }) {
        let storage;
        switch(physicalType) {
            case "AppStorage":
                storage = new Storage.AppStorage({ limitSize: +limit });
                break;
            case "LocalStorage":
                storage = new Storage.LocalStorage({ limitSize: +limit });
                break;
            case "AsyncStorage":
                storage = new Storage.AsyncStorage({ limitSize: +limit });
                break;
        }
        if(!storage) return false;
        switch(logicalType) {
            case "amount":
                storage.setCountingStrategy(new CountStrategy.CountByNumberStrategy());
                break;
            case "size":
                storage.setCountingStrategy(new CountStrategy.CountBySizeStrategy());
                break;
        }
        let storageId = this.props.cache.addStorage(storage);
        if(storageId) this.setState({ storages: [...this.state.storages, storageId] });
        else console.warn("localStorage is already");
    }

    generateSet() {
        const { key, value } = generateItem();

        this.props.cache.set(key, value).catch(err => console.warn(err));
    }

    generateGet() {
        let allKeys = [],
            selectedKey
        ;

        this.state.storages.map(storageId => this.props.cache.getStorageById(storageId)).forEach(storage => allKeys.push(...storage.getAllKeys()));
        selectedKey = allKeys[Math.floor(Math.random() * allKeys.length)];
        this.props.cache.get(selectedKey).catch(err => console.warn(err));
    }

    render() {
        const { cache } = this.props;
        const { set, get, remove } = cache;

        return(
            <div className="app">
                <Row style={styles.container}>
                    <Col md={3} style={styles.sideBar}>
                        <StorageManager addStorage={this.addStorage} />
                        <KeyValueForm title='Set' color='yellow' onSubmit={set.bind(cache)} hasValueField />
                        <KeyValueForm title='Get' color='green' onSubmit={get.bind(cache)} />
                        <KeyValueForm title='Remove' color='red' onSubmit={remove.bind(cache)} />
                    </Col>
                    <Col md={9}>
                        <Row>
                            <Generator title='SetTest' generate={this.generateSet} />
                            <Generator title='GetTest' generate={this.generateGet}/>
                        </Row>

                        <StorageList cache={this.props.cache} storages={this.state.storages}/>
                    </Col>
                </Row>
            </div>
        )
    }
}

const styles = {
    container: {
        margin: 0
    },
    sideBar: {
        borderRight: '2px solid #398439'
    }
};

App.PropTypes = {
    cache: React.PropTypes.object.isRequired
};

export default App;
