/**
 * Created by Karim on 23.07.2017.
 */
import ICountingStrategy from './ICountingStrategy';
import sizeof from 'object-sizeof';

class CountBySizeStrategy extends ICountingStrategy {
    getSize(value) {
        return sizeof(value);
    }
}

export default CountBySizeStrategy;
