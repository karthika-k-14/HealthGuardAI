package com.healthguard.gateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.Set;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HealthGuard AI - API Gateway Documentation")
                        .version("1.0.0")
                        .description("Centralized API Gateway routing and security documentation for all HealthGuard AI platform microservices.")
                        .contact(new Contact().name("HealthGuard Team").email("support@healthguard.app"))
                        .license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0")));
    }

    @Bean
    public Set<SwaggerUiConfigProperties.SwaggerUrl> swaggerUrls(SwaggerUiConfigProperties swaggerUiConfigProperties) {
        Set<SwaggerUiConfigProperties.SwaggerUrl> urls = new HashSet<>();
        
        urls.add(new SwaggerUiConfigProperties.SwaggerUrl("auth-service", "/api/auth/v3/api-docs", "Auth Service API"));
        urls.add(new SwaggerUiConfigProperties.SwaggerUrl("citizen-service", "/api/citizens/v3/api-docs", "Citizen Service API"));
        urls.add(new SwaggerUiConfigProperties.SwaggerUrl("community-service", "/api/phc/v3/api-docs", "Community Service API"));
        urls.add(new SwaggerUiConfigProperties.SwaggerUrl("pharmacist-service", "/api/pharmacist/v3/api-docs", "Pharmacist Service API"));
        urls.add(new SwaggerUiConfigProperties.SwaggerUrl("admin-service", "/api/admin/v3/api-docs", "Admin Service API"));
        urls.add(new SwaggerUiConfigProperties.SwaggerUrl("health-ai-service", "/api/ai/health/openapi.json", "Python FastAPI Health AI"));

        swaggerUiConfigProperties.setUrls(urls);
        return urls;
    }
}
