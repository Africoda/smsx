# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of SMSX seriously. If you have discovered a security vulnerability, please report it to us as described below.

### Please Do

- **Report privately**: Email security concerns to the maintainers (find contact in GitHub profile) rather than opening a public issue
- **Provide details**: Include as much information as possible about the vulnerability
- **Be patient**: We aim to respond within 48 hours
- **Follow up**: Check back on your report after initial response

### Please Don't

- **Don't exploit**: Do not exploit the vulnerability beyond what is necessary to demonstrate it
- **Don't disclose publicly**: Do not disclose the vulnerability publicly until we've had a chance to address it
- **Don't demand bounties**: This is an open-source project with no bug bounty program

### What to Include

When reporting a vulnerability, please include:

1. **Type of vulnerability**: e.g., SQL injection, XSS, authentication bypass
2. **Location**: File path and line numbers if possible
3. **Step-by-step reproduction**: Detailed steps to reproduce the issue
4. **Impact assessment**: What an attacker could do with this vulnerability
5. **Suggested fix**: If you have ideas on how to fix it (optional)
6. **Your contact info**: So we can follow up with questions

Example report:

```
Subject: [SECURITY] SQL Injection in contact search

Type: SQL Injection
Location: src/modules/contacts/service.ts, line 45
Severity: High

Description:
The contact search endpoint doesn't properly sanitize user input,
allowing SQL injection attacks.

Steps to Reproduce:
1. Make a POST request to /api/contacts/search
2. Include payload: {"query": "' OR 1=1--"}
3. All contacts are returned instead of filtered results

Impact:
An attacker could:
- Access all contacts in the database
- Modify or delete data
- Potentially access user credentials

Suggested Fix:
Use parameterized queries or the existing Drizzle ORM methods
instead of string concatenation.
```

## Security Response Process

1. **Acknowledgment**: We'll acknowledge your report within 48 hours
2. **Investigation**: We'll investigate and assess the severity
3. **Fix Development**: We'll develop and test a fix
4. **Disclosure**: We'll coordinate disclosure timing with you
5. **Release**: We'll release the fix and publish a security advisory
6. **Credit**: You'll be credited in the release notes (if desired)

## Security Best Practices

When using SMSX, follow these security best practices:

### Environment Variables

✅ **Do:**

- Use strong, random JWT secrets (32+ characters)
- Rotate secrets periodically
- Keep `.env` files out of version control
- Use different secrets for different environments

❌ **Don't:**

- Use default or weak secrets
- Commit secrets to repositories
- Share secrets via insecure channels
- Reuse secrets across projects

### Authentication

✅ **Do:**

- Use HTTPS in production
- Implement proper session management
- Set secure cookie flags (HttpOnly, Secure, SameSite)
- Implement rate limiting on auth endpoints

❌ **Don't:**

- Store passwords in plain text
- Allow weak passwords
- Expose sensitive data in logs
- Use predictable JWT secrets

### Database

✅ **Do:**

- Use connection pooling
- Enable SSL for database connections in production
- Regularly backup your database
- Use least-privilege database users

❌ **Don't:**

- Expose database credentials
- Use root database user for application
- Allow direct database access from internet
- Skip database migrations

### API

✅ **Do:**

- Validate all input
- Implement rate limiting
- Use CORS appropriately
- Log security events

❌ **Don't:**

- Trust client input
- Expose detailed error messages to clients
- Allow unrestricted file uploads
- Skip authentication checks

### Deployment

✅ **Do:**

- Use HTTPS/TLS
- Keep dependencies updated
- Monitor application logs
- Use a firewall
- Implement proper access controls

❌ **Don't:**

- Run as root user
- Expose unnecessary ports
- Skip security headers
- Ignore security warnings

## Known Security Considerations

### Rate Limiting

Current rate limiting is in-memory and resets on server restart. For production deployments with multiple instances, consider using:

- Redis-based rate limiting
- API gateway rate limiting
- Cloud provider rate limiting

### Session Management

Refresh tokens are stored in the database. Consider:

- Implementing token rotation
- Adding device fingerprinting
- Setting up session monitoring
- Implementing logout from all devices

### File Upload

Current CSV upload implementation:

- Validates file type
- Limits to CSV files
- Validates content format

Additional considerations:

- Implement file size limits
- Scan for malware (in production)
- Store files securely
- Validate file extensions server-side

### SMS Provider

MNotify API key security:

- Store securely in environment variables
- Rotate keys periodically
- Monitor usage for anomalies
- Implement cost limits

## Dependency Security

We regularly audit dependencies:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

### Automated Security

We use:

- **Dependabot**: Automatic dependency updates
- **npm audit**: Vulnerability scanning
- **CodeQL**: Static code analysis
- **ESLint**: Code quality and security linting

## Compliance

SMSX aims to help you comply with:

- **GDPR**: Personal data handling
- **CCPA**: California consumer privacy
- **SMS regulations**: Opt-in/opt-out requirements

However, **you are responsible** for:

- Implementing proper consent mechanisms
- Handling data deletion requests
- Following local SMS regulations
- Maintaining audit logs

## Security Checklist for Production

Before deploying to production, ensure:

- [ ] Environment variables are set securely
- [ ] Strong JWT secret is configured (32+ characters)
- [ ] HTTPS/TLS is enabled
- [ ] Database uses SSL/TLS
- [ ] CORS is configured for specific origins (not `*`)
- [ ] Rate limiting is properly configured
- [ ] Logging is enabled and monitored
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] Security headers are configured
- [ ] File upload limits are set
- [ ] Database backups are automated
- [ ] Monitoring and alerting are set up
- [ ] Access controls are in place
- [ ] API documentation doesn't expose sensitive endpoints

## Incident Response

If a security incident occurs:

1. **Contain**: Immediately contain the issue
2. **Assess**: Determine the scope and impact
3. **Notify**: Inform affected users if required
4. **Fix**: Deploy a fix as soon as possible
5. **Learn**: Conduct a post-mortem
6. **Improve**: Update security practices

## Security Updates

Subscribe to security updates:

- Watch the GitHub repository
- Check CHANGELOG.md regularly
- Monitor security advisories
- Join project discussions

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NPM Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [Hono Security](https://hono.dev/guides/security)

## Contact

For security concerns:

- **Email**: [Contact maintainers via GitHub]
- **Response Time**: Within 48 hours
- **Disclosure**: Coordinated with reporter

---

Thank you for helping keep SMSX secure! 🔒
