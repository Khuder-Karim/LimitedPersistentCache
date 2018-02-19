import React, { Component, PropTypes } from 'react';
import { Row, Col, FormControl, ControlLabel, Button } from 'react-bootstrap';

class Generator extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isActive: false,
            timerId: null,
            ms: 0
        };

        this.changeMode      = this.changeMode.bind(this);
        this.changeTimeValue = this.changeTimeValue.bind(this);
    }

    changeTimeValue(event) {
        this.setState({ ms: event.target.value });
    }

    changeMode() {
        const { isActive, ms } = this.state;
        let { timerId } = this.state;

        if (isActive) {
            clearInterval(timerId);
            timerId = null;
        } else {
            timerId = setInterval(this.props.generate, ms);
        }

        this.setState({ timerId, isActive: !isActive, ms: isActive ? 0 : ms });
    }

    render() {
        const { isActive, ms } = this.state;
        const { title } = this.props;

        return (
            <Col md={6}>
                <ControlLabel>{title} Timeout</ControlLabel>
                <FormControl
                    type     = "number"
                    value    = {ms}
                    onChange = {this.changeTimeValue}
                />
                <Button onClick={this.changeMode} disabled={!ms && !isActive}>{isActive ? 'Stop' : 'Start'}</Button>
            </Col>
        );
    }
}

const styles = {
};

Generator.PropTypes = {
    title    : PropTypes.string,
    generate : PropTypes.func
};

export default Generator;
