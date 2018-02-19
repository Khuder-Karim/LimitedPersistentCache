import React from 'react';
import StorageItem from '../components/StorageItem';

import { Row } from 'react-bootstrap';

const StorageList = props => {
    const { storages, cache } = props;

    return (
        <Row>
            {storages.map((storageId, i) => <StorageItem key={i} cache={cache} storageId={storageId}/>)}
        </Row>
    );
};

StorageList.PropTypes = {
    cache    : React.PropTypes.object.isRequired,
    storages : React.PropTypes.array.isRequired
};

export default StorageList;
