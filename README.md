````markdown
# RPG Web App 2

A full-stack web application built to support tabletop RPG campaigns with real-time collaboration, tactical board management, character sheets, scheduling, and session communication.

This project was designed as more than a CRUD app — it combines a modern frontend, a secure backend, real-time WebSocket communication, and a structured domain model tailored to multiplayer RPG workflows.

## Overview

**RPG Web App 2** is a full-stack application that helps players and game masters manage RPG campaigns in one place.

The platform includes:

- user authentication and access control,
- campaign and member management,
- character sheet creation and editing,
- real-time tactical board interaction,
- in-session chat and dice rolling,
- session scheduling with voting,
- notifications and campaign activity tracking.

From a technical perspective, the project focuses on building a responsive and interactive system that combines REST APIs, JWT-based security, PostgreSQL persistence, and WebSocket-driven live updates.

## Why This Project Stands Out

This project demonstrates practical full-stack engineering skills across several areas:

- designing and implementing a **client-server architecture**,
- building a **React + TypeScript** frontend for a feature-rich SPA,
- developing a **Spring Boot** backend with modular domain structure,
- implementing **JWT authentication and route protection**,
- handling **real-time communication** with **WebSocket/STOMP**,
- integrating a **PostgreSQL** database with JPA/Hibernate,
- organizing a codebase as a **multi-module monorepo**,
- solving product-like problems such as campaign collaboration, session planning, and shared board state.

Rather than focusing on a single feature, the application brings together multiple interacting systems in one cohesive product.

## Key Features

### Authentication and Security

- user registration and login,
- JWT-based authentication,
- secured backend endpoints,
- protected frontend routes.

### Campaign Management

- create and manage RPG campaigns,
- invite users to campaigns,
- accept invitations,
- retrieve campaign details,
- assign active boards to campaigns,
- upload campaign-related images.

### Character System

- create detailed character sheets,
- edit character attributes and metadata,
- manage equipment, armor, weapons, talents, and skills,
- upload character images,
- support character-specific spell sections.

### Real-Time Tactical Board

- interactive tactical board in the browser,
- token placement and movement,
- drawable board elements,
- board background uploads,
- switching between campaign boards,
- fog of war support for the game master,
- real-time synchronization between connected users.

### Communication and Gameplay Support

- campaign chat,
- system messages,
- dice rolling mechanics,
- support for GM-specific roll visibility rules.

### Session Scheduling

- propose session dates,
- vote on proposed session terms,
- track upcoming sessions,
- manage session status lifecycle.

### Notification System

- unread notification count,
- user-specific notifications,
- mark notifications as read,
- invitation-related actions and updates.

## Architecture

The application follows a classic **frontend-backend architecture** with real-time extensions.

### Frontend

The frontend is a **Single Page Application** built with React and TypeScript. It is responsible for:

- routing and page rendering,
- user interaction,
- campaign and character views,
- board rendering and interaction,
- API communication,
- WebSocket event handling.

### Backend

The backend is built with Spring Boot and exposes:

- REST API endpoints,
- authentication and authorization logic,
- business/domain logic,
- WebSocket messaging for live features,
- persistence layer integration with PostgreSQL.

### Database

PostgreSQL is used as the main relational database for storing:

- users,
- campaigns,
- characters,
- boards,
- notifications,
- messages,
- session planning data,
- dice roll and gameplay-related state.

## Tech Stack

### Frontend

- **React 19**
- **TypeScript**
- **Vite**
- **React Router**
- **Axios**
- **React Calendar**
- **Konva / React Konva**
- **SockJS**
- **STOMP**

### Backend

- **Java 17**
- **Spring Boot 3**
- **Spring Web**
- **Spring Security**
- **Spring Data JPA**
- **Spring WebSocket / Messaging**
- **JWT (jjwt)**
- **Lombok**

### Database & Infrastructure

- **PostgreSQL 16**
- **Docker Compose**

## Repository Structure

```text
rpg-web-app2/
├── rpg-webapp-backend/     # Spring Boot backend
├── rpg-webapp-frontend2/   # React + TypeScript + Vite frontend
├── docker-compose.yml      # local PostgreSQL setup
└── README.md
```
````

### Example backend modules

```text
rpg-webapp-backend/src/main/java/com/rpgapp/rpg_webapp/
├── auth
├── board
├── calendar
├── campaign
├── character
├── chat
├── config
├── drawings
├── messages
├── notifications
├── rolls
└── user
```

### Example frontend modules

```text
rpg-webapp-frontend2/src/
├── components/
│   ├── board
│   ├── calendar
│   ├── chat
│   ├── gmpanel
│   ├── header
│   └── notifications
├── pages/
│   ├── campaigns
│   ├── characters
│   ├── loginregister
│   ├── profile
│   └── upcoming-sessions
├── ws/
├── App.tsx
└── config.ts
```

## Local Setup

### Requirements

To run the project locally, make sure you have:

- **Node.js 20+**
- **npm**
- **Java 17**
- **Maven** or `mvnw`
- **Docker** and **Docker Compose**

### 1. Clone the repository

```bash
git clone <repository-url>
cd rpg-web-app2
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Configure the backend

Create a local `application.properties` or `application.yml` file.

Example configuration:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/rpgapp
spring.datasource.username=postgres
spring.datasource.password=<your_password>

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

app.frontend-url=http://localhost:5173
server.port=8080
```

### 4. Start the backend

```bash
cd rpg-webapp-backend
./mvnw spring-boot:run
```

For Windows:

```bash
mvnw.cmd spring-boot:run
```

### 5. Start the frontend

```bash
cd rpg-webapp-frontend2
npm install
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

## Environment Configuration

### Frontend

```env
VITE_API_URL=http://localhost:8080
```

The project already includes a local `.env` setup for connecting the frontend to a backend running on port `8080`.

## Available Scripts

### Frontend

```bash
npm run dev      # start development server
npm run build    # build production version
npm run preview  # preview production build
npm run lint     # run ESLint
```

### Backend

```bash
./mvnw spring-boot:run   # start backend
./mvnw test              # run tests
./mvnw clean package     # build application
```

## What I Focused on

This project was a strong exercise in building a feature-rich full-stack product with both standard and real-time functionality.

Key implementation areas included:

- structuring a larger application into clear backend domains,
- connecting a typed frontend with a secured Java backend,
- implementing authentication flow end-to-end,
- synchronizing shared user interactions over WebSockets,
- designing features that reflect real product workflows instead of isolated demo screens.
