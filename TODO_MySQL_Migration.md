# MySQL Migration TODO

## Phase 1: Update Dependencies (pom.xml)
- [x] 1.1 Update auth-service/pom.xml - Replace PostgreSQL with MySQL
- [x] 1.2 Update user-service/pom.xml - Replace PostgreSQL with MySQL
- [x] 1.3 Update activity-service/pom.xml - Replace PostgreSQL with MySQL
- [x] 1.4 Update planner-service/pom.xml - Replace PostgreSQL with MySQL
- [x] 1.5 Update notification-service/pom.xml - Replace PostgreSQL with MySQL
- [x] 1.6 Add vertx-mysql-client dependency to all services

## Phase 2: Docker Compose Configuration
- [x] 2.1 Add MySQL service to docker-compose.yml
- [x] 2.2 Add environment variables for database connection
- [x] 2.3 Create SQL initialization scripts (mysql/init.sql)

## Phase 3: Service Implementation
- [x] 3.1 Update auth-service - Implement MySQL database operations
- [x] 3.2 Update user-service - Implement MySQL database operations
- [x] 3.3 Update activity-service - Implement MySQL database operations
- [x] 3.4 Update planner-service - Implement MySQL database operations
- [x] 3.5 Update notification-service - Implement MySQL database operations

