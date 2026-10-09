\# CloudCart — Cloud-Native Application Deployment, CI/CD Automation \& Observability



A cloud-native e-commerce demonstration application showcasing containerisation, automated CI/CD, Kubernetes deployment, horizontal pod autoscaling, and monitoring with Prometheus and Grafana.



\## Project Overview



CloudCart is a Flask-based e-commerce demo application built to demonstrate how an application can be packaged, deployed, monitored, and automatically scaled using modern DevOps tools.



The project uses GitHub Actions to automate Docker image builds and publishing to Docker Hub. Slack notifications report pipeline success or failure. The application runs on a local Kubernetes cluster using Docker Desktop, with Prometheus and Grafana providing observability.



\## Architecture



```text

Developer

&#x20;  |

&#x20;  | Git push to main

&#x20;  v

GitHub Repository

&#x20;  |

&#x20;  v

GitHub Actions CI/CD

&#x20;  |

&#x20;  +---- Build Docker image

&#x20;  |

&#x20;  +---- Push image to Docker Hub

&#x20;  |

&#x20;  +---- Send Slack notification

&#x20;  |

&#x20;  v

Docker Hub

&#x20;  |

&#x20;  v

Kubernetes on Docker Desktop

&#x20;  |

&#x20;  +---- CloudCart Deployment

&#x20;  |       |

&#x20;  |       +---- Service

&#x20;  |       |

&#x20;  |       +---- Horizontal Pod Autoscaler

&#x20;  |

&#x20;  +---- Prometheus

&#x20;  |       |

&#x20;  |       +---- Collects metrics

&#x20;  |

&#x20;  +---- Grafana

&#x20;          |

&#x20;          +---- Dashboards and visualisation

```



\*\*Deployment environment:\*\* Local Kubernetes on Docker Desktop. The CI/CD pipeline publishes the Docker image to Docker Hub; Kubernetes deployment updates are performed separately.



\## Technology Stack



| Technology | Purpose |

|---|---|

| Python and Flask | Application backend |

| HTML, CSS and JavaScript | User interface |

| Docker | Containerisation |

| Docker Hub | Container image registry |

| Git and GitHub | Source control |

| GitHub Actions | CI/CD automation |

| Slack | Pipeline notifications |

| Kubernetes | Application orchestration |

| Metrics Server | Resource metrics for HPA |

| Prometheus | Metrics collection |

| Grafana | Monitoring dashboards |



\## Application Features



\- E-commerce storefront with product listings.

\- Product search, filtering and sorting.

\- Shopping cart and demo checkout flow.

\- REST API endpoints for products and demo orders.

\- Health-check endpoint for application verification.

\- Docker-based application packaging.



\### API Endpoints



| Endpoint | Method | Purpose |

|---|---|---|

| `/` | GET | Displays the storefront |

| `/health` | GET | Returns application health status |

| `/api/products` | GET | Returns the product catalogue |

| `/api/orders` | POST | Creates a demo order response |



The checkout is for demonstration purposes. It does not implement real payments or persistent order storage.



\## Repository



GitHub: https://github.com/amn-khn/CloudCart



Docker Hub: https://hub.docker.com/r/amxnn/cloudcart



\## Run Locally with Docker



\### Prerequisites



\- Docker Desktop installed and running.

\- Git installed (optional, for cloning).



Clone the repository:



```bash

git clone https://github.com/amn-khn/CloudCart.git

cd CloudCart

```



Build the Docker image:



```bash

docker build -t cloudcart:local .

```



Run the container:



```bash

docker run --name cloudcart-local -p 5000:5000 cloudcart:local

```



Open the application:



\- Storefront: http://localhost:5000

\- Health check: http://localhost:5000/health



To stop and remove the container:



```bash

docker stop cloudcart-local

docker rm cloudcart-local

```



\## Docker Hub



The published image is available at:



https://hub.docker.com/r/amxnn/cloudcart



Pull and run the latest image:



```bash

docker pull amxnn/cloudcart:latest

docker run --name cloudcart-demo -p 5000:5000 amxnn/cloudcart:latest

```



The GitHub Actions workflow publishes the `latest` tag and a commit-SHA tag when triggered by a push to `main`.



\## CI/CD Pipeline



Workflow file: `.github/workflows/docker-publish.yml`



The GitHub Actions workflow automates the following steps:



1\. Checks out the source code.

2\. Sets up Docker Buildx.

3\. Authenticates with Docker Hub using GitHub Actions secrets.

4\. Builds the CloudCart Docker image.

5\. Publishes the image to Docker Hub.

6\. Sends a Slack notification after success or failure.



\### Required GitHub Actions Secrets



Configure these secrets under \*\*GitHub repository → Settings → Secrets and variables → Actions\*\*.



| Secret | Purpose |

|---|---|

| `DOCKERHUB\_USERNAME` | Docker Hub username |

| `DOCKERHUB\_TOKEN` | Docker Hub access token |

| `SLACK\_WEBHOOK\_URL` | Slack incoming webhook URL |



Never commit access tokens, webhook URLs, or passwords to the repository.



\## Kubernetes Deployment



The application has been deployed to a local Kubernetes cluster using Docker Desktop.



Check the deployment:



```bash

kubectl get deployment cloudcart

kubectl get pods

kubectl get services

```



Inspect the autoscaler:



```bash

kubectl get hpa cloudcart

kubectl describe hpa cloudcart

```



\### Application Resource Configuration



The CloudCart deployment uses these resource settings:



| Resource | Request | Limit |

|---|---:|---:|

| CPU | 100m | 500m |

| Memory | 128Mi | 256Mi |



The application is exposed internally through a Kubernetes Service. Local access can be provided using port forwarding:



```bash

kubectl port-forward deployment/cloudcart 8080:5000

```



Then open http://localhost:8080.



Port forwarding must remain active while accessing the application.



\## Horizontal Pod Autoscaling



The Kubernetes Horizontal Pod Autoscaler (HPA) adjusts the number of CloudCart replicas based on CPU utilisation.



Configuration:



\- Minimum replicas: 1

\- Maximum replicas: 5

\- Target CPU utilisation: 50% of requested CPU



Check HPA status:



```bash

kubectl get hpa cloudcart --watch

```



Check current resource usage:



```bash

kubectl top pods

```



\### Load Testing



A temporary BusyBox pod was used to repeatedly call the application's health endpoint:



```bash

kubectl run cpu-load --image=busybox:1.36 --restart=Never -- /bin/sh -c "while true; do wget -q -O- http://cloudcart:5000/health >/dev/null; done"

```



Remove the load generator after testing:



```bash

kubectl delete pod cpu-load

```



\### Observed Results



During the local test:



\- CPU utilisation increased above the 50% target, reaching approximately 230%.

\- The HPA scaled CloudCart from 1 replica to 5 replicas.

\- After the load generator was removed, CPU utilisation dropped to approximately 1%.

\- The HPA automatically scaled the deployment back from 5 replicas to 1.



These are observed results from the local test environment, not a production performance benchmark.



\## Prometheus and Grafana



The `kube-prometheus-stack` Helm chart was installed into a dedicated `monitoring` namespace.



Check the monitoring pods:



```bash

kubectl get pods -n monitoring

```



Access Grafana locally:



```bash

kubectl port-forward -n monitoring service/monitoring-grafana 3000:80

```



Open http://localhost:3000.



The local demo was configured with the username `admin` and a temporary Grafana password. Use the password configured for your installation. Do not publish passwords or Kubernetes secrets.



\### Monitoring Capabilities



\- Kubernetes cluster CPU and memory dashboards.

\- Namespace and container resource metrics.

\- CloudCart container CPU usage.

\- CloudCart container memory usage.

\- Time-series visualisation through PromQL queries.



Example CPU query:



```promql

rate(container\_cpu\_usage\_seconds\_total{namespace="default",container="cloudcart"}\[5m])

```



Example memory query:



```promql

container\_memory\_working\_set\_bytes{namespace="default",container="cloudcart"}

```



The exact metrics available depend on the Prometheus scrape configuration and the labels exposed by the environment.



\## Testing and Validation



The following checks were performed during development:



\- Verified the application's health endpoint.

\- Built and ran the application as a Docker container.

\- Published the image to Docker Hub.

\- Verified a successful GitHub Actions workflow.

\- Confirmed Slack pipeline notifications.

\- Deployed CloudCart to Kubernetes.

\- Verified Kubernetes resource metrics with Metrics Server.

\- Installed Prometheus and Grafana.

\- Queried CloudCart CPU and memory metrics in Grafana.

\- Observed HPA scale-out and scale-in under a temporary load test.



\## Security and Limitations



\- The application is a demonstration e-commerce system, not a production commerce platform.

\- Orders are not persisted, and payment processing is not implemented.

\- Kubernetes runs locally on Docker Desktop rather than on a managed production cluster.

\- Metrics Server was configured with insecure kubelet TLS verification for this local development environment. This setting is not appropriate for production.

\- Demo credentials and local monitoring configuration must be secured before any public or production deployment.

\- The project has not been presented as a production-grade security or load-testing assessment.



\## Future Improvements



\- Deploy the application to AWS EKS.

\- Use AWS ECR or another managed container registry.

\- Implement automated Kubernetes deployment after image publishing.

\- Add automated application tests to the CI/CD workflow.

\- Add persistent order storage and proper application secrets management.

\- Introduce HTTPS, ingress configuration and production-grade security.

\- Add application-specific metrics, alerts and service-level indicators.



\## Conclusion



CloudCart demonstrates an end-to-end DevOps workflow for a containerised application, from source control and automated image publishing to Kubernetes orchestration, horizontal autoscaling and observability.



The project provides practical experience with Docker, GitHub Actions, Kubernetes, Prometheus and Grafana, while establishing a foundation for future deployment to a cloud environment.



