const request = require('request');
const fs = require('fs');

// параметры запроса
const options = {
    method: 'GET',
    url: 'https://api.binance.com/api/v3/klines',
    qs: {
        symbol: 'ETHUSDT',
        interval: '1h',
        limit: 5000
    }
};
 
request(options, function (error, response, body) {
    if (error) throw new Error(error);
    const data = JSON.parse(body);
    
    // выборка значений
    const prices = data.map(bar => ({
        open: bar[1],
        high: bar[2],
        low: bar[3],
        close: bar[4]
    }));
    
    // сохранение в файл
    fs.writeFile('price.json', JSON.stringify(prices), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log('Цены сохранены в файл price.json');
        }
    });
});
