const options = {
  scenarios: {
    postback: {
      executor: 'constant-vus',
      exec: 'default',
      env: { SCENARIO: 'postback' },
      vus: 1,
      duration: '5s',
    },
    postbackRandom: {
      executor: 'constant-vus',
      exec: 'default',
      env: { SCENARIO: 'postbackRandom' },
      vus: 1,
      duration: '5s',
    },
  },
  thresholds: {
    'http_req_duration{scenario:postback}': ['p(95)<=2000'],
    'http_req_duration{scenario:postbackRandom}': ['p(95)<=2000'],
    http_req_failed: ['rate<0.01'],
  },
}

export default options
