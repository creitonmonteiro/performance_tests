import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Criando métricas customizadas
export let postbackRequests = new Counter('postbackRequests');
export let postbackDuration = new Trend('postbackDuration');

export default function () {
  const url = 'https://hosturl/wiremock/postback';

  group('postback', function () {
    let res = http.post(url);

    // Incrementa contador
    postbackRequests.add(1);
    postbackDuration.add(res.timings.duration);

    check(res, {
      'Status should be 200': (r) => r.status === 200,
      'Response time should be <= 2000ms': (r) => r.timings.duration <= 2000,
    });
  });

  sleep(0.5);
}
