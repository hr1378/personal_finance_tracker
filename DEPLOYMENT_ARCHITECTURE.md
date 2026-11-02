# Deployment Architecture Document

## Overview

This document describes the complete deployment architecture of the Personal Finance and Debt Tracker application using Docker Compose. The application follows a microservices architecture with an API Gateway pattern, event-driven communication via Kafka, and PostgreSQL for persistent storage.

## Network Architecture

### Network: `finance-network`
- **Type**: Bridge network
- **Purpose**: Internal communication between all containers
- **Isolation**: Containers can communicate using service names (DNS resolution)
- **External Access**: Services expose specific ports to the host machine

---

## Container Details

### 1. Zookeeper

**Purpose**: Distributed coordination service for Kafka

**Image**: `confluentinc/cp-zookeeper:7.5.0`

**Container Name**: `finance-zookeeper`

**Ports**:
- `2181:2181` (Host → Container) - Client port for Zookeeper connections

**Environment Variables**:
- `ZOOKEEPER_CLIENT_PORT=2181` - Port for client connections
- `ZOOKEEPER_TICK_TIME=2000` - Basic time unit in milliseconds

**Dependencies**: None

**Health Check**: None

**Network Connections**:
- Receives connections from Kafka on port 2181

**Data Persistence**: None (stateless)

---

### 2. Kafka

**Purpose**: Event streaming platform for asynchronous communication between services

**Image**: `confluentinc/cp-kafka:7.5.0`

**Container Name**: `finance-kafka`

**Ports**:
- `9092:9092` (Host → Container) - Internal broker listener
- `9093:9093` (Host → Container) - External/host listener

**Environment Variables**:
- `KAFKA_BROKER_ID=1` - Unique broker identifier
- `KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181` - Zookeeper connection string
- `KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:9093` - Advertised listeners for clients
- `KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT` - Security protocol mapping
- `KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT` - Inter-broker listener name
- `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1` - Replication factor for offset topic
- `KAFKA_AUTO_CREATE_TOPICS_ENABLE="true"` - Auto-create topics when needed

**Dependencies**:
- `zookeeper` (service)

**Health Check**:
- **Command**: `kafka-broker-api-versions --bootstrap-server localhost:9092`
- **Interval**: 10 seconds
- **Timeout**: 10 seconds
- **Retries**: 5

**Network Connections**:
- Connects to Zookeeper on `zookeeper:2181`
- Receives connections from transaction-service, budget-service, debt-service, dashboard-service on `kafka:9092`

**Data Persistence**: None (stateless, uses Zookeeper for coordination)

---

### 3. PostgreSQL

**Purpose**: Relational database for persistent data storage

**Image**: `postgres:15`

**Container Name**: `finance-postgres`

**Ports**:
- `5432:5432` (Host → Container) - PostgreSQL default port

**Environment Variables**:
- `POSTGRES_USER=finance` - Database username
- `POSTGRES_PASSWORD=finance` - Database password
- `POSTGRES_DB=finance` - Default database name

**Volumes**:
- `postgres-data:/var/lib/postgresql/data` - Persistent data storage

**Dependencies**: None

**Health Check**:
- **Command**: `pg_isready -U finance`
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Retries**: 5

**Network Connections**:
- Receives connections from all Spring Boot services on `postgres:5432`

**Database Schemas**:
- `public` - Used by transaction-service
- `auth` - Used by auth-service
- `budget` - Used by budget-service
- `debt` - Used by debt-service
- `dashboard` - Used by dashboard-service

**Data Persistence**: Yes (via Docker volume)

---

### 4. Auth Service

**Purpose**: Authentication and user management service

**Image**: Built from `./services/auth-service/Dockerfile`

**Container Name**: `auth-service`

**Ports**:
- `8081:8081` (Host → Container) - HTTP API port

**Docker Environment Variables** (override application.properties):
- `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/finance`
- `SPRING_DATASOURCE_USERNAME=finance`
- `SPRING_DATASOURCE_PASSWORD=finance`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`

**Application Properties** (from `application.properties`):
- `server.port=8081`
- `spring.flyway.schemas=auth` - Uses auth schema
- `jwt.secret=your-secret-key-change-in-production` - JWT signing key
- `jwt.expiration=86400000` - Token expiration (24 hours)
- `spring.web.cors.allowed-origins=http://localhost:5173` - CORS origins
- `management.endpoints.web.exposure.include=health,info,metrics` - Actuator endpoints

**Dependencies**:
- `postgres` (service, condition: healthy)

**Health Check**:
- **Command**: `curl -f http://localhost:8081/actuator/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

**Network Connections**:
- Connects to PostgreSQL on `postgres:5432`
- Receives HTTP requests from API Gateway on port 8081

**API Endpoints**:
- `POST /api/auth/register` - User registration (public)
- `POST /api/auth/login` - User login (public)
- `GET /actuator/health` - Health check (public)

**Data Persistence**: No (uses PostgreSQL)

---

### 5. Transaction Service

**Purpose**: Transaction management and category management service

**Image**: Built from `./services/transaction-service/Dockerfile`

**Container Name**: `transaction-service`

**Ports**:
- `8082:8082` (Host → Container) - HTTP API port

**Docker Environment Variables** (override application.properties):
- `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/finance`
- `SPRING_DATASOURCE_USERNAME=finance`
- `SPRING_DATASOURCE_PASSWORD=finance`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`

**Application Properties** (from `application.properties`):
- `server.port=8082`
- `spring.kafka.bootstrap-servers=kafka:9092` - Kafka producer configuration
- `spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer`
- `spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer`

**Dependencies**:
- `postgres` (service, condition: healthy)

**Health Check**:
- **Command**: `curl -f http://localhost:8082/actuator/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

**Network Connections**:
- Connects to PostgreSQL on `postgres:5432`
- Connects to Kafka on `kafka:9092` (producer only)
- Receives HTTP requests from API Gateway on port 8082

**API Endpoints**:
- `GET /api/transactions` - Get transactions (authenticated)
- `POST /api/transactions` - Create transaction (authenticated)
- `GET /api/transactions/{id}` - Get transaction by ID (authenticated)
- `DELETE /api/transactions/{id}` - Delete transaction (authenticated)
- `GET /api/transactions/summary` - Get transaction summary (authenticated)
- `GET /actuator/health` - Health check (public)

**Kafka Events**:
- Produces transaction events to Kafka for consumption by budget-service and dashboard-service

**Data Persistence**: No (uses PostgreSQL)

---

### 6. Budget Service

**Purpose**: Budget management and spending tracking service

**Image**: Built from `./services/budget-service/Dockerfile`

**Container Name**: `budget-service`

**Ports**:
- `8083:8083` (Host → Container) - HTTP API port

**Docker Environment Variables** (override application.properties):
- `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/finance`
- `SPRING_DATASOURCE_USERNAME=finance`
- `SPRING_DATASOURCE_PASSWORD=finance`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`

**Application Properties** (from `application.properties`):
- `server.port=8083`
- `spring.flyway.schemas=budget` - Uses budget schema
- `spring.kafka.bootstrap-servers=kafka:9092` - Kafka consumer configuration
- `spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer`
- `spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer`
- `spring.kafka.consumer.properties.spring.json.trusted.packages=*`
- `spring.web.cors.allowed-origins=http://localhost:5173`

**Dependencies**:
- `postgres` (service, condition: healthy)
- `transaction-service` (service, condition: healthy)

**Health Check**:
- **Command**: `curl -f http://localhost:8083/actuator/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

**Network Connections**:
- Connects to PostgreSQL on `postgres:5432`
- Connects to Kafka on `kafka:9092` (consumer only)
- Receives HTTP requests from API Gateway on port 8083

**API Endpoints**:
- `GET /api/budgets/user/{userId}` - Get user budgets (authenticated)
- `GET /api/budgets/{id}` - Get budget by ID (authenticated)
- `POST /api/budgets` - Create budget (authenticated)
- `PUT /api/budgets/{id}` - Update budget (authenticated)
- `DELETE /api/budgets/{id}` - Delete budget (authenticated)
- `GET /actuator/health` - Health check (public)

**Kafka Events**:
- Consumes transaction events from Kafka to update budget calculations

**Data Persistence**: No (uses PostgreSQL)

---

### 7. Debt Service

**Purpose**: Debt tracking and management service

**Image**: Built from `./services/debt-service/Dockerfile`

**Container Name**: `debt-service`

**Ports**:
- `8084:8084` (Host → Container) - HTTP API port

**Docker Environment Variables** (override application.properties):
- `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/finance`
- `SPRING_DATASOURCE_USERNAME=finance`
- `SPRING_DATASOURCE_PASSWORD=finance`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`

**Application Properties** (from `application.properties`):
- `server.port=8084`
- `spring.flyway.schemas=debt` - Uses debt schema
- `spring.kafka.bootstrap-servers=kafka:9092` - Kafka producer configuration
- `spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer`
- `spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer`
- `spring.web.cors.allowed-origins=http://localhost:5173`

**Dependencies**:
- `postgres` (service, condition: healthy)

**Health Check**:
- **Command**: `curl -f http://localhost:8084/actuator/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

**Network Connections**:
- Connects to PostgreSQL on `postgres:5432`
- Connects to Kafka on `kafka:9092` (producer only)
- Receives HTTP requests from API Gateway on port 8084

**API Endpoints**:
- `GET /api/debts/user/{userId}` - Get user debts (authenticated)
- `GET /api/debts/{id}` - Get debt by ID (authenticated)
- `POST /api/debts` - Create debt (authenticated)
- `PUT /api/debts/{id}` - Update debt (authenticated)
- `DELETE /api/debts/{id}` - Delete debt (authenticated)
- `GET /actuator/health` - Health check (public)

**Kafka Events**:
- Produces debt events to Kafka for consumption by dashboard-service

**Data Persistence**: No (uses PostgreSQL)

---

### 8. Dashboard Service

**Purpose**: Aggregates data from other services for dashboard views

**Image**: Built from `./services/dashboard-service/Dockerfile`

**Container Name**: `dashboard-service`

**Ports**:
- `8085:8085` (Host → Container) - HTTP API port

**Docker Environment Variables** (override application.properties):
- `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/finance`
- `SPRING_DATASOURCE_USERNAME=finance`
- `SPRING_DATASOURCE_PASSWORD=finance`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`
- `TRANSACTION_SERVICE_URL=http://transaction-service:8082`
- `BUDGET_SERVICE_URL=http://budget-service:8083`
- `DEBT_SERVICE_URL=http://debt-service:8084`

**Application Properties** (from `application.properties`):
- `server.port=8085`
- `spring.flyway.schemas=dashboard` - Uses dashboard schema
- `spring.kafka.bootstrap-servers=kafka:9092` - Kafka consumer configuration
- `spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer`
- `spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer`
- `spring.kafka.consumer.properties.spring.json.trusted.packages=*`
- `transaction.service.url=${TRANSACTION_SERVICE_URL:http://localhost:8082}`
- `budget.service.url=${BUDGET_SERVICE_URL:http://localhost:8083}`
- `debt.service.url=${DEBT_SERVICE_URL:http://localhost:8084}`
- `spring.web.cors.allowed-origins=http://localhost:5173`

**Dependencies**:
- `postgres` (service, condition: healthy)
- `transaction-service` (service, condition: healthy)
- `budget-service` (service, condition: healthy)
- `debt-service` (service, condition: healthy)

**Health Check**:
- **Command**: `curl -f http://localhost:8085/actuator/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

**Network Connections**:
- Connects to PostgreSQL on `postgres:5432`
- Connects to Kafka on `kafka:9092` (consumer only)
- Makes HTTP requests to transaction-service on `transaction-service:8082`
- Makes HTTP requests to budget-service on `budget-service:8083`
- Makes HTTP requests to debt-service on `debt-service:8084`
- Receives HTTP requests from API Gateway on port 8085

**API Endpoints**:
- `GET /api/dashboard/summary/{userId}` - Get user dashboard summary (authenticated)
- `GET /actuator/health` - Health check (public)

**Kafka Events**:
- Consumes transaction events from transaction-service
- Consumes debt events from debt-service

**Data Persistence**: No (uses PostgreSQL)

---

### 9. API Gateway

**Purpose**: Single entry point for all client requests, routes to appropriate microservices

**Image**: Built from `./infrastructure/gateway/Dockerfile`

**Container Name**: `api-gateway`

**Ports**:
- `8080:8080` (Host → Container) - HTTP API port

**Docker Environment Variables**:
- `AUTH_SERVICE_URL=http://auth-service:8081`
- `TRANSACTION_SERVICE_URL=http://transaction-service:8082`
- `BUDGET_SERVICE_URL=http://budget-service:8083`
- `DEBT_SERVICE_URL=http://debt-service:8084`
- `DASHBOARD_SERVICE_URL=http://dashboard-service:8085`

**Dependencies**:
- `auth-service` (service, condition: healthy)
- `transaction-service` (service, condition: healthy)
- `budget-service` (service, condition: healthy)
- `debt-service` (service, condition: healthy)
- `dashboard-service` (service, condition: healthy)

**Health Check**:
- **Command**: `curl -f http://localhost:8080/actuator/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

**Network Connections**:
- Routes requests to auth-service on `auth-service:8081`
- Routes requests to transaction-service on `transaction-service:8082`
- Routes requests to budget-service on `budget-service:8083`
- Routes requests to debt-service on `debt-service:8084`
- Routes requests to dashboard-service on `dashboard-service:8085`
- Receives HTTP requests from frontend on port 8080

**Routing Rules**:
- `/api/auth/**` → auth-service
- `/api/transactions/**` → transaction-service
- `/api/budgets/**` → budget-service
- `/api/debts/**` → debt-service
- `/api/dashboard/**` → dashboard-service

**Features**:
- JWT authentication filter
- CORS configuration
- Request/response transformation

**Data Persistence**: No (stateless)

---

### 10. Frontend

**Purpose**: React-based user interface for the application

**Image**: Built from `./frontend/Dockerfile`

**Container Name**: `frontend`

**Ports**:
- `3000:80` (Host → Container) - HTTP port (nginx on port 80 internally)

**Environment Variables**: None

**Dependencies**:
- `gateway` (service, condition: healthy)

**Health Check**: None

**Network Connections**:
- Makes HTTP requests to API Gateway on `gateway:8080`

**API Configuration**:
- Base URL: `http://localhost:8080/api` (configurable via `VITE_API_BASE_URL`)
- All API calls go through the gateway

**Technology Stack**:
- React with TypeScript
- Vite build system
- Nginx for serving static files

**Data Persistence**: No (static files)

---

## Startup Order

Services start in the following order based on dependencies:

1. **zookeeper** - No dependencies
2. **postgres** - No dependencies
3. **kafka** - Depends on zookeeper
4. **auth-service** - Depends on postgres (healthy)
5. **transaction-service** - Depends on postgres (healthy)
6. **debt-service** - Depends on postgres (healthy)
7. **budget-service** - Depends on postgres (healthy) and transaction-service (healthy)
8. **dashboard-service** - Depends on postgres (healthy), transaction-service (healthy), budget-service (healthy), and debt-service (healthy)
9. **gateway** - Depends on all microservices (healthy)
10. **frontend** - Depends on gateway (healthy)

---

## Service Communication Flow

### Request Flow (Frontend → Backend)

```
Frontend (port 3000)
    ↓ HTTP
API Gateway (port 8080)
    ↓ Routes based on path
↓
├─→ Auth Service (port 8081)
├─→ Transaction Service (port 8082)
├─→ Budget Service (port 8083)
├─→ Debt Service (port 8084)
└─→ Dashboard Service (port 8085)
```

### Event Flow (Kafka)

```
Transaction Service (Producer)
    ↓ Kafka (port 9092)
    ↓
├─→ Budget Service (Consumer)
└─→ Dashboard Service (Consumer)

Debt Service (Producer)
    ↓ Kafka (port 9092)
    ↓
└─→ Dashboard Service (Consumer)
```

### Service-to-Service HTTP Calls

```
Dashboard Service
    ↓ HTTP
├─→ Transaction Service (port 8082)
├─→ Budget Service (port 8083)
└─→ Debt Service (port 8084)
```

---

## Database Schema Isolation

Each service uses a separate PostgreSQL schema for data isolation:

- **auth schema**: user_profiles table
- **public schema**: transactions, categories tables
- **budget schema**: budgets table
- **debt schema**: debts, debt_payments tables
- **dashboard schema**: dashboard_views table

All schemas exist within the same `finance` database.

---

## Security Considerations

### Authentication
- JWT-based authentication via auth-service
- Token expiration: 24 hours
- All API endpoints (except register/login) require valid JWT token

### CORS Configuration
- All Spring Boot services allow CORS from `http://localhost:5173`
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: *
- Credentials allowed: true

### Environment Variables
- Database credentials are set via environment variables
- JWT secret should be changed in production
- Service URLs are configurable via environment variables

---

## Data Persistence

### Docker Volumes
- `postgres-data`: Persistent storage for PostgreSQL data
  - Location: `/var/lib/postgresql/data` in container
  - Survives container restarts and recreations

### Kafka & Zookeeper
- No persistent volumes (stateless for development)
- Topics are auto-created when needed
- Offset data is stored in Kafka internal storage

---

## Health Check Configuration

All Spring Boot services use the same health check pattern:

- **Endpoint**: `/actuator/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds (time for service to start before health checks begin)

### Additional Health Checks

- **PostgreSQL**: `pg_isready -U finance` (10s interval, 5s timeout, 5 retries)
- **Kafka**: `kafka-broker-api-versions --bootstrap-server localhost:9092` (10s interval, 10s timeout, 5 retries)

---

## Port Summary

| Service | Host Port | Container Port | Purpose |
|---------|-----------|----------------|---------|
| Frontend | 3000 | 80 | Web UI |
| API Gateway | 8080 | 8080 | API entry point |
| Auth Service | 8081 | 8081 | Authentication |
| Transaction Service | 8082 | 8082 | Transactions |
| Budget Service | 8083 | 8083 | Budgets |
| Debt Service | 8084 | 8084 | Debts |
| Dashboard Service | 8085 | 8085 | Dashboard |
| PostgreSQL | 5432 | 5432 | Database |
| Kafka | 9092, 9093 | 9092, 9093 | Event streaming |
| Zookeeper | 2181 | 2181 | Coordination |

---

## Environment Variable Reference

### Global Database Variables (applied to all Spring Boot services)
- `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/finance`
- `SPRING_DATASOURCE_USERNAME=finance`
- `SPRING_DATASOURCE_PASSWORD=finance`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`

### Dashboard Service Specific
- `TRANSACTION_SERVICE_URL=http://transaction-service:8082`
- `BUDGET_SERVICE_URL=http://budget-service:8083`
- `DEBT_SERVICE_URL=http://debt-service:8084`

### Gateway Specific
- `AUTH_SERVICE_URL=http://auth-service:8081`
- `TRANSACTION_SERVICE_URL=http://transaction-service:8082`
- `BUDGET_SERVICE_URL=http://budget-service:8083`
- `DEBT_SERVICE_URL=http://debt-service:8084`
- `DASHBOARD_SERVICE_URL=http://dashboard-service:8085`

---

## Scaling Considerations

### Horizontal Scaling
- All Spring Boot services can be scaled horizontally
- Kafka can be scaled with multiple brokers
- PostgreSQL would require master-slave or cluster setup for scaling

### Load Balancing
- API Gateway can be placed behind a load balancer
- Each service can run multiple instances
- Service discovery would be needed (currently using Docker service names)

### High Availability
- Add Zookeeper ensemble (3+ nodes)
- Add Kafka replication (multiple brokers)
- Add PostgreSQL replication (master-slave or streaming replication)
- Add health checks and auto-restart policies

---

## Troubleshooting

### Common Issues

1. **Service fails to start**: Check health check logs and service dependencies
2. **Database connection refused**: Ensure PostgreSQL is healthy and network is working
3. **Kafka connection errors**: Ensure Zookeeper is running and Kafka is healthy
4. **Gateway 500 errors**: Check if downstream services are healthy and accessible
5. **Port conflicts**: Check if ports are already in use on the host machine

### Useful Commands

```bash
# View all containers
docker compose ps

# View logs for a specific service
docker compose logs [service-name]

# View logs for all services
docker compose logs

# Restart a specific service
docker compose restart [service-name]

# Rebuild and restart a service
docker compose up -d --build [service-name]

# Execute command in a container
docker compose exec [service-name] [command]

# View health status
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```

---

## Production Deployment Recommendations

1. **Change default passwords**: Update database credentials and JWT secret
2. **Use secrets management**: Use Docker secrets or environment-specific configuration
3. **Enable TLS/SSL**: Configure HTTPS for all services
4. **Add resource limits**: Set CPU and memory limits in docker-compose.yml
5. **Configure logging**: Use centralized logging (ELK, Splunk, etc.)
6. **Add monitoring**: Implement metrics collection and alerting
7. **Backup strategy**: Regular PostgreSQL backups
8. **Network security**: Use separate networks for different tiers
9. **Rate limiting**: Add rate limiting at the gateway
10. **Audit logging**: Log all authentication and authorization events
