import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { sendSlackReport } from './report/slack_report.js';
import options from './rampups/smoke_test.js';
import postback from './scenarios/postback.js';
import postbackRandom from './scenarios/postback_random.js';

export { options };


export default function () {
  const scenarioName = __ENV.SCENARIO;

  if (scenarioName === 'postback') {
    postback();
  } else if (scenarioName === 'postbackRandom') {
    postbackRandom();
  }
}

export function handleSummary(data) {
  sendSlackReport(data);

  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
