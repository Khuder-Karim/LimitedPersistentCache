/**
 * Created by Karim on 23.07.2017.
 */

import React, { Component } from 'react';
import { Row, Col, Panel } from 'react-bootstrap';
import { CountStrategy } from 'LimitedPersistentCache';

class StorageItem extends Component {
    constructor(props) {
        super(props);

        this.storage = props.cache.getStorageById(props.storageId);

        this.state = {
            data: Object.assign({}, this.storage.getSortedData()),
            hit: 0,
            miss: 0
        };

        this.changeListener  = this.changeListener.bind(this);
        this.renderStats     = this.renderStats.bind(this);
        this.renderStatusBar = this.renderStatusBar.bind(this);
        this.getUnits = this.getUnits.bind(this);
    }

    changeListener(changeObj) {
        let { miss, hit } = this.state;

        if (changeObj.command === 'get') {
            if (changeObj.value) hit++;
            else miss++;
        }

        this.setState({ data: Object.assign({}, this.storage.getSortedData()), hit, miss });
    }

    componentDidMount() {
        this.unSubscribeKey = this.storage.subscribe(this.changeListener);
    }

    componentWillMount() {
        this.storage.unSubscribe(this.unSubscribeKey);
    }

    renderItem(key, value) {
        return (
            <Row key={key}>
                <div style={Object.assign({}, styles.block, styles.label)}>key:</div>
                <div style={styles.block}>{key}</div>
                <div style={Object.assign({}, styles.block, styles.label)}>value:</div>
                <div style={styles.block}>{value}</div>
            </Row>
        );
    }

    renderStatusBar() {
        const { hit, miss } = this.state;
        const width = 250;

        const hitWidth = hit + miss ? hit / (hit + miss) : 0;
        const missWidth = hit + miss ? miss / (hit + miss) : 0;

        return (
            <Row>
                {hitWidth
                ? <div
                    style={Object.assign({}, styles.hitBar, { width: width * hitWidth })}
                  >
                    hit - {Math.round(hitWidth * 100 * 100) / 100} %
                  </div>
                : null}
                {missWidth
                ? <div
                    style={Object.assign({}, styles.missBar, { width: width * missWidth })}
                  >
                    miss - {Math.round(missWidth * 100 * 100) / 100} %
                  </div>
                : null}
            </Row>
        );
    }

    getUnits() {
        return this.storage._countingStrategy instanceof CountStrategy.CountBySizeStrategy
            ? "byte"
            : "amount"
    }

    renderStats() {
        const { limitSize, currentSize, fullness } = this.storage.getStat();
        const units = this.getUnits();

        return (
            <Col md={4}>
                <Row>Limit Size: {limitSize} {units}</Row>
                <Row>Current Size: {currentSize} {units}</Row>
                <Row>Fullness: {fullness * 100} %</Row>
                {this.renderStatusBar()}
            </Col>
        );
    }

    render() {
        const { data } = this.state;

        return (
            <Panel bsStyle="success">
                <Col md={8}>
                    {Object.keys(data).map(key => this.renderItem(key, data[key]))}
                </Col>
                {this.renderStats()}
            </Panel>
        );
    }
}

const styles = {
    block: {
        width: 100,
        display: 'inline-block',
        borderBottom: '0.5px solid #398439'
    },
    statsBlock: {

    },
    label: {
        color: 'grey'
    },
    container: {
        border: '1px solid red',
        minHeight: 50,
        margin: '10px 0 0 0'
    },
    hitBar: {
        display: 'inline',
        backgroundColor: '#449d44',
        border: '1px solid #398439'
    },
    missBar: {
        display: 'inline',
        backgroundColor: '#d9534f',
        border: '1px solid #d43f3a'
    }
};

StorageItem.PropTypes = {
    storageId: React.PropTypes.number.isRequired,
    cache: React.PropTypes.object.isRequired
};

export default StorageItem;
