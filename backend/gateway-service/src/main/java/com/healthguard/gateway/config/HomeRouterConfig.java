package com.healthguard.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.web.reactive.function.server.RequestPredicates.GET;

/**
 * Reactive RouterFunction Configuration for Gateway root endpoints (/ and /index.html).
 * Provides top-priority WebFlux routing for the HealthGuard AI Welcoming Home Page.
 */
@Configuration
public class HomeRouterConfig {

    @Bean
    public RouterFunction<ServerResponse> homeRoute() {
        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>HealthGuard AI — API Gateway & Central Platform Hub</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    }

                    body {
                        background-color: #090D16;
                        color: #F3F4F6;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        overflow-x: hidden;
                    }

                    .bg-glow {
                        position: absolute;
                        width: 600px;
                        height: 600px;
                        border-radius: 50%;
                        background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 70%);
                        top: -200px;
                        left: 50%;
                        transform: translateX(-50%);
                        pointer-events: none;
                        z-index: 0;
                    }

                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 2.5rem 1.5rem;
                        position: relative;
                        z-index: 1;
                        flex-grow: 1;
                    }

                    header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-bottom: 2rem;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                        margin-bottom: 3rem;
                    }

                    .brand {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    }

                    .brand-logo {
                        width: 42px;
                        height: 42px;
                        background: linear-gradient(135deg, #10B981, #06B6D4);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
                    }

                    .brand-logo svg {
                        width: 24px;
                        height: 24px;
                        fill: white;
                    }

                    .brand-title {
                        font-size: 1.35rem;
                        font-weight: 700;
                        background: linear-gradient(135deg, #FFFFFF, #9CA3AF);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        letter-spacing: -0.02em;
                    }

                    .status-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.4rem 0.9rem;
                        border-radius: 9999px;
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.25);
                        color: #34D399;
                        font-size: 0.85rem;
                        font-weight: 600;
                    }

                    .pulse-dot {
                        width: 8px;
                        height: 8px;
                        background-color: #10B981;
                        border-radius: 50%;
                        box-shadow: 0 0 10px #10B981;
                        animation: pulse 2s infinite;
                    }

                    @keyframes pulse {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                    }

                    .hero {
                        text-align: center;
                        margin-bottom: 3.5rem;
                    }

                    .hero h1 {
                        font-size: 2.75rem;
                        font-weight: 800;
                        line-height: 1.2;
                        margin-bottom: 1rem;
                        background: linear-gradient(135deg, #FFFFFF 30%, #A7F3D0 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        letter-spacing: -0.03em;
                    }

                    .hero p {
                        font-size: 1.15rem;
                        color: #9CA3AF;
                        max-width: 680px;
                        margin: 0 auto 2rem;
                        line-height: 1.6;
                    }

                    .cta-group {
                        display: flex;
                        justify-content: center;
                        gap: 1rem;
                        flex-wrap: wrap;
                    }

                    .btn {
                        padding: 0.85rem 1.75rem;
                        border-radius: 12px;
                        font-weight: 600;
                        font-size: 0.95rem;
                        text-decoration: none;
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .btn-primary {
                        background: linear-gradient(135deg, #10B981, #059669);
                        color: white;
                        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35);
                    }

                    .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 25px rgba(16, 185, 129, 0.5);
                    }

                    .btn-secondary {
                        background: rgba(255, 255, 255, 0.06);
                        color: #F3F4F6;
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        backdrop-filter: blur(10px);
                    }

                    .btn-secondary:hover {
                        background: rgba(255, 255, 255, 0.12);
                        transform: translateY(-2px);
                    }

                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 1.5rem;
                        margin-bottom: 3rem;
                    }

                    .card {
                        background: rgba(17, 24, 39, 0.7);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        border-radius: 16px;
                        padding: 1.75rem;
                        backdrop-filter: blur(12px);
                        transition: all 0.3s ease;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }

                    .card:hover {
                        border-color: rgba(16, 185, 129, 0.3);
                        transform: translateY(-4px);
                        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
                    }

                    .card-icon {
                        width: 44px;
                        height: 44px;
                        border-radius: 12px;
                        background: rgba(16, 185, 129, 0.12);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 1.25rem;
                        color: #10B981;
                    }

                    .card-title {
                        font-size: 1.15rem;
                        font-weight: 700;
                        margin-bottom: 0.5rem;
                        color: #F9FAFB;
                    }

                    .card-desc {
                        font-size: 0.9rem;
                        color: #9CA3AF;
                        line-height: 1.5;
                        margin-bottom: 1.25rem;
                    }

                    .card-link {
                        color: #34D399;
                        text-decoration: none;
                        font-size: 0.9rem;
                        font-weight: 600;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.35rem;
                        transition: gap 0.2s ease;
                    }

                    .card-link:hover {
                        gap: 0.6rem;
                    }

                    footer {
                        border-top: 1px solid rgba(255, 255, 255, 0.08);
                        padding: 1.75rem 0;
                        text-align: center;
                        color: #6B7280;
                        font-size: 0.875rem;
                    }
                </style>
            </head>
            <body>
                <div class="bg-glow"></div>
                <div class="container">
                    <header>
                        <div class="brand">
                            <div class="brand-logo">
                                <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                            </div>
                            <span class="brand-title">HealthGuard AI</span>
                        </div>
                        <div class="status-badge">
                            <div class="pulse-dot"></div>
                            API Gateway Active (Port 8080)
                        </div>
                    </header>

                    <section class="hero">
                        <h1>Welcome to HealthGuard AI Platform</h1>
                        <p>Centralized microservices API Gateway providing secure routing, OpenAPI documentation, and high-performance health surveillance endpoints.</p>
                        <div class="cta-group">
                            <a href="/swagger-ui.html" class="btn btn-primary">
                                Explore Swagger API Docs
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </a>
                            <a href="http://localhost:5173" target="_blank" class="btn btn-secondary">
                                Open Web App (Port 5173)
                            </a>
                        </div>
                    </section>

                    <div class="grid">
                        <div class="card">
                            <div>
                                <div class="card-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                </div>
                                <h2 class="card-title">Centralized Swagger UI</h2>
                                <p class="card-desc">Interactive OpenAPI 3.0 documentation for all backend microservices, unified under one dashboard.</p>
                            </div>
                            <a href="/swagger-ui.html" class="card-link">Launch Swagger UI &rarr;</a>
                        </div>

                        <div class="card">
                            <div>
                                <div class="card-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                </div>
                                <h2 class="card-title">Citizen Service API</h2>
                                <p class="card-desc">Endpoints for citizen profiles, notifications, medicine reminders, and health document management.</p>
                            </div>
                            <a href="/api/citizens/v3/api-docs" target="_blank" class="card-link">View OpenAPI Specification &rarr;</a>
                        </div>

                        <div class="card">
                            <div>
                                <div class="card-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                </div>
                                <h2 class="card-title">AI & Triage Service</h2>
                                <p class="card-desc">AI health analysis, symptom checker, disease surveillance, and FastAPI Python triage integrations.</p>
                            </div>
                            <a href="/api/ai/v3/api-docs" target="_blank" class="card-link">View OpenAPI Specification &rarr;</a>
                        </div>

                        <div class="card">
                            <div>
                                <div class="card-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                                </div>
                                <h2 class="card-title">System Health & Actuator</h2>
                                <p class="card-desc">Monitor microservices liveness, database connections, and API Gateway route health.</p>
                            </div>
                            <a href="/actuator/health" target="_blank" class="card-link">Check System Health &rarr;</a>
                        </div>
                    </div>
                </div>

                <footer>
                    <p>&copy; 2026 HealthGuard AI Platform — Powered by Spring Cloud Gateway & Reactive WebFlux.</p>
                </footer>
            </body>
            </html>
            """;

        return RouterFunctions.route(
                GET("/").or(GET("/index.html")),
                request -> ServerResponse.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .bodyValue(html)
        ).andRoute(
                GET("/favicon.ico"),
                request -> ServerResponse.noContent().build()
        );
    }
}
