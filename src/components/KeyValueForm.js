import React, { Component, PropTypes } from 'react';
import { Row, FormGroup, Button, FormControl } from 'react-bootstrap';

class KeyValueForm extends Component {
    constructor(props) {
        super(props);
        this.handleSubmitForm = this.handleSubmitForm.bind(this);

        this.state = {
            key   : '',
            value : ''
        };
    }

    handleSubmitForm(e) {
        e.preventDefault();
        const { key, value } = this.state;
        this.props.onSubmit(key, value).catch(err => console.warn(err));
    }

    handleData(fieldName) {
        return event => this.setState({ [fieldName]: event.target.value });
    }

    render() {
        const { title, color, hasValueField } = this.props;

        return (
            <form onSubmit={this.handleSubmitForm}>
                <FormGroup role="form" style={styles.form}>
                    <Row style={Object.assign({}, styles.container, styles.inline)}>
                        <FormControl
                            onChange    = {this.handleData("key")}
                            type        = "text"
                            placeholder = "key"
                            style       = {Object.assign({}, styles.inline, hasValueField ? styles.inputTwo : styles.inputOne)}
                        />
                        {hasValueField
                        ? <FormControl
                            onChange    = {this.handleData("value")}
                            type        = "text"
                            placeholder = "value"
                            style       = {Object.assign({}, styles.inline, styles.inputTwo)}
                        />
                        : null}

                        <Button
                            type      = "submit"
                            className = {`btn btn-${styles.button[color]} btn-large centerButton`}
                        >
                            {title}
                        </Button>
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
    inputOne: {
        width: 205,
        marginRight: 5
    },
    inputTwo: {
        width: 100,
        marginRight: 5
    },
    form: {
        margin: 0
    },
    button: { 'yellow': 'warning', 'green': 'success', 'red': 'error' }
};

KeyValueForm.PropTypes = {
    title         : PropTypes.string,
    color         : PropTypes.oneOf(['yellow', 'green']),
    hasValueField : PropTypes.bool,
    onSubmit      : PropTypes.func
};

export default KeyValueForm;
