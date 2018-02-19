import React, { Component, PropTypes } from 'react';
import {
    Row,
    Button,
    FormGroup,
    ControlLabel,
    FormControl,
    Radio,
    RadioGroup
} from 'react-bootstrap';

class StorageManager extends Component {
    constructor (props) {
        super(props);
        this.handleCreateStorage = this.handleCreateStorage.bind(this);

        this.state = {
            physicalType: "AppStorage",
            logicalType : "amount",
            limit: 5
        };
    }

    handleCreateStorage (e) {
        e.preventDefault();
        this.props.addStorage(this.state);
        this.setState({ limit: 5, physicalType: "AppStorage", logicalType : "size" });
    }

    handleData(fieldName) {
        return event => {
            let newValue = event.target.value,
                newState = { [fieldName]: newValue };
            fieldName === "logicalType"
                ? newValue === "size"
                    ? newState.limit = 100
                    : newState.limit = 1
                : null
            ;
            this.setState(newState);
        }
    }

    render() {
        return (
            <form onSubmit={this.handleCreateStorage}>
                <FormGroup role="form">
                    <Row style={styles.container}>
                        <div style={styles.legendContainer}>
                            <legend style={styles.legend}>Add level</legend>
                            <Button
                                type      = "submit"
                                className = "btn btn-success btn-large centerButton"
                            >
                                +
                            </Button>
                        </div>

                        <ControlLabel>Physical Type</ControlLabel>
                        <Radio
                            onChange = {this.handleData("physicalType")}
                            name     = "physicalType"
                            value    = "AppStorage"
                            checked  = {this.state.physicalType === "AppStorage"}
                        >
                            App Storage
                        </Radio>
                        <Radio
                            onChange = {this.handleData("physicalType")}
                            name     = "physicalType"
                            value    = "LocalStorage"
                            checked  = {this.state.physicalType === "LocalStorage"}
                        >
                            Local Storage
                        </Radio>
                        <Radio
                            onChange = {this.handleData("physicalType")}
                            name     = "physicalType"
                            value    = "AsyncStorage"
                            checked  = {this.state.physicalType === "AsyncStorage"}
                        >
                            Async Storage
                        </Radio>


                        <ControlLabel>Logical Type</ControlLabel>
                        <Radio
                            onChange = {this.handleData("logicalType")}
                            value    = "size"
                            checked  = {this.state.logicalType === "size"}
                        >
                            Count by size
                        </Radio>
                        <Radio
                            onChange = {this.handleData("logicalType")}
                            value    = "amount"
                            checked  = {this.state.logicalType === "amount"}
                        >
                            Count by amount
                        </Radio>

                        <Row style={styles.inline}>
                            <ControlLabel style={styles.inline}>Limit</ControlLabel>
                            <FormControl
                                onChange = {this.handleData("limit")}
                                value    = {this.state.limit}
                                type     = 'number'
                                min={ this.state.logicalType === "size" ? 100 : 1 }
                                style    = {Object.assign({}, styles.inline, styles.limitInput)}
                            />
                        </Row>
                    </Row>
                </FormGroup>
            </form>
        );
    }
}

const styles = {
    container: {
        padding: 10
    },
    inline: {
        display: 'inline'
    },
    limitInput: {
        width: 70,
        marginLeft: 15
    },
    legendContainer: {
        display: 'flex',
        marginBottom: 20
    },
    legend: {
        margin: 0
    }
};

StorageManager.PropTypes = {
    addStorage: PropTypes.func
};

export default StorageManager;
