import http from 'k6/http';

function compareWithThreshold(value, threshold) {
  const thresholdPassed = value <= threshold;
  const statusEmoji = thresholdPassed ? "✅" : "❌";
  return { thresholdPassed, statusEmoji, value };
}

export function sendSlackReport(data) {
  const webhookURL = ''

  let message = "📝 *Relatório de Teste K6 - Public Wiremock* 📊\n\n";

  const scenarioNames = new Set();
  Object.keys(data.metrics).forEach(metric => {
    const match = metric.match(/http_req_duration{scenario:(.+?)}/);
    if (match) {
      scenarioNames.add(match[1]);
    }
  });

  scenarioNames.forEach(scenarioName => {
    const totalRequests = data.metrics[`${scenarioName}Requests`]?.values?.count
    const avgDuration = data.metrics[`http_req_duration{scenario:${scenarioName}}`]?.values?.avg?.toFixed(2) || 'N/A';
    const p95Duration = data.metrics[`http_req_duration{scenario:${scenarioName}}`]?.values['p(95)']?.toFixed(2) || 'N/A';
    const errorRate = data.metrics[`http_req_failed{scenario:${scenarioName}}`]?.values?.rate
      ? (data.metrics[`http_req_failed{scenario:${scenarioName}}`]?.values.rate * 100).toFixed(2)
      : '0';

    let thresholdsResults = "";
    if (data.metrics[`http_req_duration{scenario:${scenarioName}}`]?.thresholds) {
      Object.entries(data.metrics[`http_req_duration{scenario:${scenarioName}}`]?.thresholds).forEach(([thresholdName, thresholdPassed]) => {
        let statusEmoji = thresholdPassed.ok ? "✅" : "❌";

        thresholdsResults = thresholdPassed.ok ? `${statusEmoji} ${thresholdName}ms\n` : `${statusEmoji} ${thresholdName}ms - O tempo de resposta p95 desse cenário de teste foi superior ao estabelecido\n`
      });
    }

    message += `🚀 *Cenário: ${scenarioName}*\n` +
               `✅ Requests: ${totalRequests}\n` +
               `⏱ Média: ${avgDuration}ms\n` +
               `📊 P95: ${p95Duration}ms\n` +
               `❌ Erros: ${errorRate}%\n\n` +
               `📌 *Thresholds:*\n${thresholdsResults}\n\n`;
  });

  const totalRequests = data.metrics['http_reqs']?.values?.count || 0;
  const avgDuration = data.metrics['http_req_duration']?.values?.avg?.toFixed(2) || 'N/A';
  const p95Duration = data.metrics['http_req_duration']?.values['p(95)']?.toFixed(2) || 'N/A';
  const errorRate = data.metrics['http_req_failed']?.values?.rate
    ? (data.metrics['http_req_failed'].values.rate * 100).toFixed(2)
    : '0';

  message += `📊 *Resumo Total*\n` +
             `✅ Requests Totais: ${totalRequests}\n` +
             `⏱ Média Geral: ${avgDuration}ms\n` +
             `📊 P95 Geral: ${p95Duration}ms\n` +
             `❌ Taxa de Erro Total: ${errorRate}%\n`;

  let payload = JSON.stringify({ text: message });

  let params = {
    headers: { 'Content-Type': 'application/json' },
  };

  let response = http.post(webhookURL, payload, params);

  console.log(`🔄 Slack Response Status: ${response.status}`);
  console.log(`🔎 Slack Response Body: ${response.body}`);
}
