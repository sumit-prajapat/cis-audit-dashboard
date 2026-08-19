# 🚀 Deployment Guide

## Production Deployment Checklist

### 1. Environment Configuration

```bash
# Generate secure SECRET_KEY
cd backend
python generate_secret.py

# Copy to .env
cp .env.example .env
# Edit .env and set:
# - SECRET_KEY (from generate_secret.py)
# - DATABASE_URL (production PostgreSQL)
# - FRONTEND_URL (production domain)
# - STRIPE keys (from Stripe Dashboard)
# - RESEND_API_KEY (from Resend Dashboard)
```

### 2. Database Setup

```bash
# Run migrations
cd backend
pip install -r requirements.txt
python -m alembic upgrade head

# Verify migration
python -m alembic current
```

### 3. Security Hardening

**Environment Variables:**
- ✅ SECRET_KEY: Generated with `generate_secret.py`
- ✅ APP_ENV: Set to `production`
- ✅ COOKIE_SECURE: Set to `true`
- ✅ COOKIE_SAMESITE: Set to `strict`
- ✅ ALLOWED_ORIGINS: Only production domains

**Database:**
- ✅ Use strong database password
- ✅ Enable SSL for database connections
- ✅ Regular backups configured

**Network:**
- ✅ HTTPS enabled (TLS 1.3)
- ✅ Firewall rules configured
- ✅ Rate limiting enabled

### 4. Docker Deployment

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check health
curl http://localhost:8000/health
curl http://localhost:8000/health/ready
```

### 5. Frontend Build

```bash
cd frontend
npm install
npm run build

# Serve with Nginx or deploy to CDN
```

### 6. Monitoring Setup

**Health Checks:**
- `/health` - Liveness probe
- `/health/ready` - Readiness probe (checks DB)

**Logs:**
- Backend: Structured JSON logs
- Database: Query logs enabled
- Nginx: Access and error logs

**Metrics:**
- API response times
- Database connection pool
- Error rates
- Compliance score trends

### 7. Backup Strategy

**Database:**
```bash
# Daily automated backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Weekly full backups
# Monthly archives
```

**Files:**
- PDF reports archived
- Configuration files versioned

### 8. Post-Deployment Verification

```bash
# Run health checks
curl https://your-domain.com/health
curl https://your-domain.com/health/ready

# Test authentication
curl -X POST https://your-domain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"test"}'

# Run automated tests
cd backend
pytest tests/ -v

# Check logs
docker-compose logs backend | grep ERROR
```

### 9. Scaling Configuration

**Horizontal Scaling:**
```yaml
# docker-compose.yml
backend:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '0.50'
        memory: 512M
```

**Database Connection Pooling:**
```python
# Already configured in database.py
pool_size=10
max_overflow=20
```

### 10. SSL/TLS Setup

**Let's Encrypt (Certbot):**
```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

## Environment-Specific Configurations

### Development
- `APP_ENV=development`
- `COOKIE_SECURE=false`
- SQLite or local PostgreSQL
- Hot reload enabled

### Staging
- `APP_ENV=staging`
- `COOKIE_SECURE=true`
- Dedicated database
- Production-like setup

### Production
- `APP_ENV=production`
- All security features enabled
- High availability database
- CDN for static assets
- Load balancer

## Rollback Procedure

```bash
# 1. Stop current deployment
docker-compose down

# 2. Restore database backup
psql $DATABASE_URL < backup_YYYYMMDD.sql

# 3. Checkout previous version
git checkout <previous-commit>

# 4. Rebuild and restart
docker-compose up -d --build

# 5. Verify health
curl http://localhost:8000/health
```

## Maintenance Windows

**Database Migrations:**
- Schedule during low-traffic hours
- Announce maintenance window
- Test on staging first
- Have rollback plan ready

**Updates:**
- Backend: Rolling updates (no downtime)
- Frontend: Blue-green deployment
- Database: Schema migrations with backward compatibility

## Support Contacts

- **Technical Issues**: Check GitHub Issues
- **Security Issues**: security@yourdomain.com
- **Performance**: Monitoring dashboard

---

**Last Updated**: August 2026
