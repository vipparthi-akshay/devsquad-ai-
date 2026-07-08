import asyncio
from collections.abc import AsyncGenerator

from app.providers.base import AIProvider, TokenUsage


class MockAIProvider(AIProvider):
    def __init__(self):
        self._last_usage = TokenUsage(prompt_tokens=100, completion_tokens=50)

    @property
    def provider_name(self) -> str:
        return "mock"

    @property
    def model_name(self) -> str:
        return "mock-model-v1"

    def get_last_token_usage(self) -> TokenUsage:
        return self._last_usage

    async def generate_text(self, prompt: str, **kwargs) -> str:
        await asyncio.sleep(0.3)
        self._last_usage = TokenUsage(prompt_tokens=len(prompt) // 2, completion_tokens=200)
        return "Mock AI response. Replace with real AI provider in production."

    async def generate_structured(self, prompt: str, output_schema: dict, **kwargs) -> dict:
        await asyncio.sleep(0.5)
        self._last_usage = TokenUsage(prompt_tokens=len(prompt) // 2, completion_tokens=150)

        if "requirements" in prompt.lower() or "product" in prompt.lower():
            return self._mock_requirements()
        if "architect" in prompt.lower() or "system" in prompt.lower():
            return self._mock_architecture()
        if "task" in prompt.lower() or "plan" in prompt.lower():
            return self._mock_task_plan()
        if "review" in prompt.lower() or "code" in prompt.lower():
            return self._mock_review()
        if "test" in prompt.lower():
            return self._mock_test_plan()
        if "security" in prompt.lower():
            return self._mock_security()

        return {"message": "Mock response for: " + prompt[:100]}

    async def stream_text(self, prompt: str, **kwargs) -> AsyncGenerator[str]:
        words = self.generate_text(prompt).split()
        for word in words:
            yield word + " "
            await asyncio.sleep(0.05)

    def _mock_requirements(self) -> dict:
        return {
            "problem_statement": "Small Indian retailers lack affordable, easy-to-use inventory management software.",
            "personas": [
                {"name": "Rajesh", "role": "Small Retailer", "needs": "Track inventory, manage suppliers, sales reports"},
                {"name": "Priya", "role": "Shop Assistant", "needs": "Quick stock lookup, easy checkout"},
            ],
            "user_journeys": [
                "Retailer signs up, adds products, manages stock, views reports",
                "Assistant scans barcodes during checkout, updates inventory automatically",
            ],
            "functional_requirements": [
                "Multi-tenant inventory tracking",
                "Barcode scanning support",
                "Supplier management",
                "Low stock alerts",
                "Sales reporting",
                "Purchase order management",
                "User role management",
            ],
            "non_functional_requirements": [
                "Support 1000+ concurrent retailers",
                "Page load under 2 seconds",
                "99.5% uptime SLA",
                "Data encrypted at rest and in transit",
                "Daily automated backups",
            ],
            "assumptions": [
                "Retailers have basic smartphone or computer",
                "Internet connectivity is available",
                "Users prefer local language support",
            ],
            "constraints": [
                "Must work on low-end devices",
                "Offline mode for intermittent connectivity",
                "Compliance with Indian tax regulations (GST)",
            ],
            "risks": [
                "Competition from established POS providers",
                "User reluctance to cloud-based solutions",
                "Integration complexity with existing accounting software",
            ],
            "acceptance_criteria": [
                "Retailer can add 1000+ products",
                "Barcode scan completes in under 1 second",
                "Reports generate within 5 seconds",
                "Low stock alerts trigger at configurable thresholds",
            ],
            "mvp_scope": [
                "User authentication and workspace",
                "Product catalog management",
                "Stock tracking with barcode support",
                "Basic sales reporting",
                "Supplier management",
            ],
            "future_scope": [
                "GST invoicing",
                "Multi-store support",
                "E-commerce integration",
                "Mobile app",
                "AI-powered demand forecasting",
            ],
        }

    def _mock_architecture(self) -> dict:
        return {
            "summary": "A modular monolith with clear domain boundaries, deployed as a single web application with PostgreSQL database.",
            "component_model": {
                "services": [
                    {"name": "Identity Service", "responsibility": "Authentication and authorization"},
                    {"name": "Catalog Service", "responsibility": "Product and category management"},
                    {"name": "Inventory Service", "responsibility": "Stock tracking and movements"},
                    {"name": "Order Service", "responsibility": "Sales and purchase orders"},
                    {"name": "Reporting Service", "responsibility": "Sales reports and analytics"},
                    {"name": "Notification Service", "responsibility": "Alerts and communications"},
                ]
            },
            "deployment_model": {
                "type": "Single web application on cloud VM",
                "database": "PostgreSQL 16",
                "cache": "Redis for session and caching",
                "storage": "S3-compatible for attachments",
            },
            "api_boundaries": ["RESTful API with versioning", "Webhook support for integrations"],
            "data_flow": "Client -> API Gateway -> Service Layer -> Database",
            "risks": [
                {"risk": "Database scaling at high tenant count", "severity": "MEDIUM", "mitigation": "Implement read replicas and query optimization"},
                {"risk": "Single point of failure", "severity": "LOW", "mitigation": "Deploy with auto-scaling and load balancer"},
                {"risk": "Data isolation between tenants", "severity": "HIGH", "mitigation": "Row-level security and tenant ID enforcement"},
            ],
            "alternatives": ["Microservices for independent scaling", "Serverless for cost optimization"],
            "decisions": [
                "Modular monolith for faster development and simpler operations",
                "PostgreSQL for relational data and JSON support",
                "Python/FastAPI for rapid API development",
                "Row-level security for multi-tenant isolation",
            ],
            "mermaid_diagram": "graph TD\n  Client[Browser/Mobile] --> API[FastAPI]\n  API --> Auth[Identity Service]\n  API --> Catalog[Catalog Service]\n  API --> Inventory[Inventory Service]\n  API --> Orders[Order Service]\n  API --> Reports[Reporting Service]\n  Auth --> DB[(PostgreSQL)]\n  Catalog --> DB\n  Inventory --> DB\n  Orders --> DB\n  Reports --> DB\n  Inventory --> Cache[(Redis)]\n  Inventory --> Queue[Message Queue]\n  Queue --> Notify[Notification Service]",
        }

    def _mock_task_plan(self) -> dict:
        return {
            "epics": [
                {
                    "name": "Foundation",
                    "stories": [
                        {"title": "Set up project infrastructure", "tasks": ["Initialize monorepo", "Set up CI/CD", "Configure database"]},
                        {"title": "Implement authentication", "tasks": ["User registration", "Login/logout", "JWT token management"]},
                    ]
                },
                {
                    "name": "Core Inventory",
                    "stories": [
                        {"title": "Product catalog", "tasks": ["CRUD products", "Category management", "Barcode assignment"]},
                        {"title": "Stock management", "tasks": ["Stock tracking", "Stock adjustments", "Low stock alerts"]},
                    ]
                }
            ],
            "tasks": [
                {"title": "Set up monorepo structure", "assignee_agent": "DEVOPS_ENGINEER", "priority": "HIGH", "estimate": 4},
                {"title": "Implement user registration API", "assignee_agent": "BACKEND_ENGINEER", "priority": "HIGH", "estimate": 8},
                {"title": "Create database schema for products", "assignee_agent": "DATABASE_ENGINEER", "priority": "HIGH", "estimate": 6},
                {"title": "Build product catalog frontend", "assignee_agent": "FRONTEND_ENGINEER", "priority": "MEDIUM", "estimate": 12},
                {"title": "Implement stock tracking logic", "assignee_agent": "BACKEND_ENGINEER", "priority": "HIGH", "estimate": 10},
                {"title": "Add barcode scanning UI", "assignee_agent": "FRONTEND_ENGINEER", "priority": "MEDIUM", "estimate": 8},
                {"title": "Generate sales reports", "assignee_agent": "BACKEND_ENGINEER", "priority": "MEDIUM", "estimate": 6},
            ]
        }

    def _mock_review(self) -> dict:
        return {
            "summary": "Code changes are generally well-structured. One potential authorization issue found.",
            "findings": [
                {
                    "title": "Missing authorization check on inventory update endpoint",
                    "description": "The inventory update endpoint does not verify that the requesting user belongs to the same tenant as the product being updated.",
                    "severity": "MEDIUM",
                    "category": "SECURITY",
                    "file_path": "app/services/inventory_service.py",
                    "line_start": 42,
                    "line_end": 55,
                    "evidence": "The update_stock method accepts product_id and quantity but does not validate tenant ownership.",
                    "recommendation": "Add a tenant ID check before updating inventory. Verify that the product belongs to the user's workspace.",
                    "confidence": "HIGH",
                },
                {
                    "title": "Missing input validation for quantity",
                    "description": "Quantity field accepts negative values which could lead to inconsistent inventory state.",
                    "severity": "LOW",
                    "category": "CORRECTNESS",
                    "file_path": "app/schemas/inventory.py",
                    "line_start": 15,
                    "line_end": 15,
                    "evidence": "Quantity field is typed as int without minimum value constraint.",
                    "recommendation": "Add Pydantic validator ensuring quantity >= 0.",
                    "confidence": "HIGH",
                }
            ],
            "overall_risk": "LOW",
        }

    def _mock_test_plan(self) -> dict:
        return {
            "summary": "Comprehensive test plan covering unit, integration, and E2E scenarios.",
            "unit_tests": [
                {"name": "Test product creation validation", "scope": "Verify required fields and constraints"},
                {"name": "Test stock adjustment logic", "scope": "Verify correct quantity updates"},
                {"name": "Test tenant isolation", "scope": "Verify users cannot access other tenants data"},
            ],
            "integration_tests": [
                {"name": "Test inventory API endpoint", "scope": "Full CRUD operations via API"},
                {"name": "Test authentication flow", "scope": "Register, login, token refresh"},
            ],
            "e2e_tests": [
                {"name": "Complete product lifecycle", "scope": "Create, update, delete, search products"},
                {"name": "Multi-user tenant isolation", "scope": "Verify data isolation between tenants"},
            ],
            "edge_cases": [
                "Concurrent stock updates",
                "Negative quantities",
                "Duplicate barcodes",
                "Network failure during transaction",
            ],
        }

    def _mock_security(self) -> dict:
        return {
            "summary": "Security review completed. One medium-severity finding identified.",
            "findings": [
                {
                    "title": "Row-level security not enforced on inventory queries",
                    "description": "Database queries filter by tenant ID only in application code, not at database level.",
                    "severity": "MEDIUM",
                    "category": "SECURITY",
                    "file_path": "app/services/inventory_service.py",
                    "recommendation": "Implement PostgreSQL row-level security policies for multi-tenant tables.",
                    "confidence": "HIGH",
                }
            ],
            "secrets_scan": "No secrets found in codebase.",
            "dependency_scan": "All dependencies are up to date with no known vulnerabilities.",
            "threat_model": {
                "assets": ["User data", "Product data", "Inventory data", "Sales data"],
                "actors": ["Retailer", "Shop assistant", "System admin", "Unauthorized user"],
                "trust_boundaries": ["Client <-> API", "API <-> Database"],
                "threats": [
                    {"threat": "Tenant data leakage", "severity": "HIGH", "mitigation": "Row-level security + tenant ID validation"},
                    {"threat": "Unauthorized API access", "severity": "HIGH", "mitigation": "JWT authentication + role-based access"},
                    {"threat": "SQL injection", "severity": "MEDIUM", "mitigation": "Parameterized queries via SQLAlchemy"},
                ],
            },
        }
