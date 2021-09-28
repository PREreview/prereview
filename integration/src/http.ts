import agent from 'agent-base';
import {
  Agent,
  ClientRequest,
  OutgoingHttpHeader,
  OutgoingHttpHeaders,
  globalAgent,
} from 'http';

export function loggingAgent(log: NodeJS.WritableStream): Agent {
  return agent((request: ClientRequest) => {
    request.on('socket', async socket => {
      log.write(`${'>'.repeat(80)}\n${requestToString(request)}\n\n`);

      socket.on('data', async data => {
        log.write(`${'<'.repeat(80)}\n${data}\n\n`);
      });
    });

    return globalAgent;
  });
}

function requestToString(request: ClientRequest): string {
  return `${request.method} ${request.path}
${headersToString(request.getHeaders())}`;
}

function headersToString(headers: OutgoingHttpHeaders): string {
  return Object.entries(headers)
    .map(([key, values]) => [key, headerToString(values || '')].join(': '))
    .join('\n');
}

function headerToString(values: OutgoingHttpHeader): string {
  return Array.isArray(values) ? values.join(', ') : values.toString();
}
