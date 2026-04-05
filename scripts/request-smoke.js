const balancerUrl = process.env.BALANCER_URL ?? 'http://localhost:3000';

let response = await fetch(`${balancerUrl}/records/42`);

if (response.status !== 200) {
  throw new Error(`Expected 200 from first record request, received ${response.status}`);
}

const first = await response.json();

response = await fetch(`${balancerUrl}/records/42`);

if (response.status !== 200) {
  throw new Error(`Expected 200 from second record request, received ${response.status}`);
}

const second = await response.json();

if (first.cached !== false || second.cached !== true) {
  throw new Error('Unexpected cache behavior');
}

if (first.instanceId === second.instanceId) {
  throw new Error('Load balancing did not reach both backend instances');
}

response = await fetch(`${balancerUrl}/metrics`);

if (response.status !== 200) {
  throw new Error(`Expected 200 from metrics, received ${response.status}`);
}

const metrics = await response.json();

if (metrics.loadBalancer.requestsTotal !== 2) {
  throw new Error('Unexpected load balancer metrics');
}

if (metrics.backends.length !== 2) {
  throw new Error('Unexpected backend metrics');
}

response = await fetch(`${balancerUrl}/health`);

if (response.status !== 200) {
  throw new Error(`Expected 200 from health, received ${response.status}`);
}

process.stdout.write('High-performance smoke passed\n');
