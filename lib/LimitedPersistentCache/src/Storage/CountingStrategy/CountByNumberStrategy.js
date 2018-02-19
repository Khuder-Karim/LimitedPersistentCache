/**
 * Created by Karim on 23.07.2017.
 */
import ICountingStrategy from './ICountingStrategy';

class CountByNumberStrategy extends ICountingStrategy {
    getSize(value) {
        return value ? 1 : 0
    }
}

export default CountByNumberStrategy;
