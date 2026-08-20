---
title: CIS Audit API
emoji: 🛡️
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# CIS Audit Dashboard API

Enterprise-grade REST API for CIS Benchmark compliance auditing.

## Features

- Multi-tenant SaaS architecture
- JWT authentication
- Role-based access control
- Audit logging
- CIS Benchmark scanning
- PDF report generation
- Stripe billing integration

## API Documentation

Visit `/api/docs` for interactive API documentation (Swagger UI).

## Health Checks

- `/` - Basic status check
- `/health` - Liveness probe
- `/health/ready` - Readiness probe (includes DB check)

## Environment Variables

Required environment variables are documented in `.env.example`.

## Repository

https://github.com/sumit-prajapat/cis-audit-dashboard
