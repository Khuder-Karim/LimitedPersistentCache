/**
 * Created by karim on 26.07.17.
 */
import sizeof from 'object-sizeof';

const alphaNumerics = () => {
    return ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9']
};

const generateString = (length) => {
    let randomSize = length || Math.floor(Math.random() * 10) + 1;

    return [...new Array(randomSize).keys()].reduce((result, current) => {
        let symbols = alphaNumerics();
        result += symbols[Math.floor(Math.random() * symbols.length)];
        return result;
    }, "");
};

export const generateItem = () => {
    return { key: generateString(), value: generateString() };
};

window.generateItem = generateItem;
