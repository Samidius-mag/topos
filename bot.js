// Получаем данные из файла price.json
const prices = require("./price.json");

// Дополнительные вводные данные
const marketActivity = 1.5;
const volatility = 46;
const upperDeviation = 2;
const lowerDeviation = -2;
const sma1 = 21;
const sma2 = 55;
const sma3 = 89;
const sma4 = 144;
const sma5 = 233;

// Функция для вычисления стандартного отклонения
const getStandardDeviation = (array, average) => {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += Math.pow(parseFloat(array[i]) - average, 2);
  }
  return Math.sqrt(sum / array.length);
};

// Функция для вычисления скользящего среднего
const sma = (array, period) => {
  const length = array.length;
  const s = [];
  let sum = 0;
  let i;
  for (i = 0; i < period - 1; i++) {
    s.push(null);
    sum += array[i];
  }
  for (; i < length; i++) {
    sum += array[i];
    s.push(sum / period);
    sum -= array[i - period + 1];
  }
  return s;
};

// Функция для получения массива цен закрытия
const getPriceArray = (field) => {
  return prices.map((price) => parseFloat(price[field]));
};

const closePriceArray = getPriceArray("close");
const smaArray1 = sma(closePriceArray, sma1);
const smaArray2 = sma(closePriceArray, sma2);
const smaArray3 = sma(closePriceArray, sma3);
const smaArray4 = sma(closePriceArray, sma4);
const smaArray5 = sma(closePriceArray, sma5);

const currentPrice = prices[prices.length - 1].close;
const average = sma(closePriceArray, sma1)[smaArray1.length - 1];
const std = getStandardDeviation(closePriceArray, average);
const upperChannel = average + upperDeviation * std;
const lowerChannel = average + lowerDeviation * std;

// Расчитываем внутренний канал
const innerDeviation = 0.7;
const innerUpperChannel = average + innerDeviation * std;
const innerLowerChannel = average + (-innerDeviation) * std;

// Функция для вычисления корреляции
const getAverage = (array) => {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += parseFloat(array[i]);
  }
  return sum / array.length;
};

const getCorrelation = (array1, array2) => {
  const average1 = getAverage(array1);
  const average2 = getAverage(array2);
  const standardDeviation1 = getStandardDeviation(array1, average1);
  const standardDeviation2 = getStandardDeviation(array2, average2);
  let sum = 0;
  for (let i = 0; i < array1.length; i++) {
    sum += (parseFloat(array1[i]) - average1) * (parseFloat(array2[i]) - average2);
  }
  const correlation = sum / (array1.length * standardDeviation1 * standardDeviation2);
  return correlation;
};

const volumeArray = getPriceArray("volume");
const correlation = getCorrelation(closePriceArray, volumeArray);

// Рассчитываем сигнал на покупку/продажу
let signal = "";
let innerSignal = "";
if (currentPrice > upperChannel && correlation > 0) {
  signal = "Sell";
} else if (currentPrice < lowerChannel && correlation < 0) {
  signal = "Buy";
}

if (currentPrice > innerUpperChannel && correlation > 0) {
  innerSignal = "Sell";
} else if (currentPrice < innerLowerChannel && correlation < 0) {
  innerSignal = "Buy";
}

// Рассчитываем тренд
let trend = "";
let innerTrend = "";
if (
  currentPrice > smaArray1[smaArray1.length - 1] &&
  smaArray1[smaArray1.length - 1] > smaArray2[smaArray2.length - 1] &&
  smaArray2[smaArray2.length - 1] > smaArray3[smaArray3.length - 1] &&
  smaArray3[smaArray3.length - 1] > smaArray4[smaArray4.length - 1] &&
  smaArray4[smaArray4.length - 1] > smaArray5[smaArray5.length - 1]
) {
  trend = "Up";
} else if (
  currentPrice < smaArray1[smaArray1.length - 1] &&
  smaArray1[smaArray1.length - 1] < smaArray2[smaArray2.length - 1] &&
  smaArray2[smaArray2.length - 1] < smaArray3[smaArray3.length - 1] &&
  smaArray3[smaArray3.length - 1] < smaArray4[smaArray4.length - 1] &&
  smaArray4[smaArray4.length - 1] < smaArray5[smaArray5.length - 1]
) {
  trend = "Down";
} else {
  trend = "Sideways";
}

if (
  currentPrice > smaArray1[smaArray1.length - 1] &&
  smaArray1[smaArray1.length - 1] > smaArray2[smaArray2.length - 1] &&
  smaArray2[smaArray2.length - 1] > smaArray3[smaArray3.length - 1] &&
  smaArray3[smaArray3.length - 1] > smaArray4[smaArray4.length - 1] &&
  smaArray4[smaArray4.length - 1] > smaArray5[smaArray5.length - 1] &&
  currentPrice > innerUpperChannel
) {
  innerTrend = "Up";
} else if (
  currentPrice < smaArray1[smaArray1.length - 1] &&
  smaArray1[smaArray1.length - 1] < smaArray2[smaArray2.length - 1] &&
  smaArray2[smaArray2.length - 1] < smaArray3[smaArray3.length - 1] &&
  smaArray3[smaArray3.length - 1] < smaArray4[smaArray4.length - 1] &&
  smaArray4[smaArray4.length - 1] < smaArray5[smaArray5.length - 1] &&
  currentPrice < innerLowerChannel
) {
  innerTrend = "Down";
} else {
  innerTrend = "Sideways";
}

// Отправляем результаты в Telegram бота
const TelegramBot = require("node-telegram-bot-api");
const token = "YOUR_TELEGRAM_BOT_TOKEN_HERE";
const chatId = "YOUR_CHAT_ID_HERE";
const bot = new TelegramBot(token);

const message = `
  Upper Channel: ${upperChannel}
  Lower Channel: ${lowerChannel}
  Correlation: ${correlation}
  Signal: ${signal}
  Trend: ${trend}

  Inner Upper Channel: ${innerUpperChannel}
  Inner Lower Channel: ${innerLowerChannel}
  Inner Signal: ${innerSignal}
  Inner Trend: ${innerTrend}
`;
bot.sendMessage(chatId, message);

// Выводим результаты
console.log(`Upper Channel: ${upperChannel}`);
console.log(`Lower Channel: ${lowerChannel}`);
console.log(`Correlation: ${correlation}`);
console.log(`Signal: ${signal}`);
console.log(`Trend: ${trend}`);

console.log(`Inner Upper Channel: ${innerUpperChannel}`);
console.log(`Inner Lower Channel: ${innerLowerChannel}`);
console.log(`Inner Signal: ${innerSignal}`);
console.log(`Inner Trend: ${innerTrend}`);
