import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Criando métricas customizadas
export let postbackRandomRequests = new Counter('postbackRandomRequests');
export let postbackRandomDuration = new Trend('postbackRandomDuration');

export default function () {
  const url = '';

  group('postbackRandom', function () {
    let res = http.post(url);

    // Incrementa contador
    postbackRandomRequests.add(1);
    postbackRandomDuration.add(res.timings.duration);

    __ENV.POSTBACK_RANDOM_REQUESTS = postbackRandomRequests.value;

    check(res, {
      'Status should be 200': (r) => r.status === 200,
      'Response time should be <= 2000ms': (r) => r.timings.duration <= 2000,
    });
  });

  sleep(0.5);
}
