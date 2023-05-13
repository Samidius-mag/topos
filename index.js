const fs = require('fs');
const tf = require('@tensorflow/tfjs-node-gpu');

const rawData = fs.readFileSync('./price.json');
const prices = JSON.parse(rawData);

const dataX = [];
const dataY = [];

for (let i = 0; i < prices.length - 1; i++) {
  const currentPrice = prices[i];
  const nextPrice = prices[i + 1];

  const openPrice = parseFloat(currentPrice.open);
  const highPrice = parseFloat(currentPrice.high);
  const lowPrice = parseFloat(currentPrice.low);
  const closePrice = parseFloat(currentPrice.close);
  const nextOpenPrice = parseFloat(nextPrice.open);

  dataX.push([openPrice, highPrice, lowPrice, closePrice]);
  dataY.push([nextOpenPrice]);
}

const model = tf.sequential();

model.add(tf.layers.dense({
  inputShape: [4],
  activation: 'relu',
  units: 10
}));

model.add(tf.layers.dense({
  inputShape: [10],
  activation: 'relu',
  units: 10
}));

model.add(tf.layers.dense({
  inputShape: [10],
  activation: 'linear',
  units: 1
}));

model.compile({
  loss: 'meanSquaredError',
  optimizer: tf.train.adam()
});

const xs = tf.tensor2d(dataX);
const ys = tf.tensor2d(dataY);

async function train() {
  const history = await model.fit(xs, ys, {
    epochs: 100,
    shuffle: true,
    validationSplit: 0.1,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
      }
    }
  });

  console.log('Training complete');
}

train();

async function predict() {
  const prediction = model.predict(tf.tensor2d([[prices[prices.length - 1].open, prices[prices.length - 1].high, prices[prices.length - 1].low, prices[prices.length - 1].close]])).dataSync()[0];

  const entryPrice = prediction;
  const trendDirection = prediction > prices[prices.length - 1].open ? 'Up' : 'Down';
  const exitPrice = trendDirection === 'Up' ? prices[prices.length - 1].low : prices[prices.length - 1].high;

  console.log(`Entry price: ${entryPrice}`);
  console.log(`Trend direction: ${trendDirection}`);
  console.log(`Exit price: ${exitPrice}`);
}

predict();
